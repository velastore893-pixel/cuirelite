// Lightweight Google Sheets integration using direct HTTP requests
// No external SDK needed - keeps build fast and small

export interface SheetConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

async function getAccessToken(config: SheetConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;

  // Create JWT header
  const header = { alg: "RS256", typ: "JWT" };
  // Create JWT claim set
  const claimSet = {
    iss: config.clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: expiry,
    iat: now,
  };

  const encodeBase64Url = (data: object) =>
    btoa(JSON.stringify(data)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const signingInput = `${encodeBase64Url(header)}.${encodeBase64Url(claimSet)}`;

  // Import crypto for signing
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(config.privateKey, "base64");
  const jwt = `${signingInput}.${signature.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;

  // Exchange JWT for access token
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Failed to get access token: " + JSON.stringify(data));
  }
  return data.access_token;
}

export async function appendToSheet(
  config: SheetConfig,
  sheetName: string,
  values: (string | number)[][]
): Promise<boolean> {
  const accessToken = await getAccessToken(config);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${sheetName}!A:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error("Sheets API error: " + JSON.stringify(error));
  }
  return true;
}

export async function testConnection(config: SheetConfig): Promise<{ success: boolean; title?: string; error?: string }> {
  try {
    const accessToken = await getAccessToken(config);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}?fields=properties.title`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return { success: false, error: "Failed to access spreadsheet" };
    }
    const data = await response.json();
    return { success: true, title: data.properties?.title };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
