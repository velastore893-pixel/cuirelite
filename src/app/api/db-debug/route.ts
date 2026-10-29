import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL missing" });
  }

  const url = new URL(value);

  const rawPassword = url.password;
  const decodedPassword = decodeURIComponent(url.password);

  return NextResponse.json({
    ok: true,
    username: decodeURIComponent(url.username),
    hostname: url.hostname,

    passwordCheck: {
      hasPassword: decodedPassword.length > 0,
      decodedLength: decodedPassword.length,
      rawLength: rawPassword.length,

      startsWithBracket:
        decodedPassword.startsWith("[") || decodedPassword.startsWith("]"),

      endsWithBracket:
        decodedPassword.endsWith("[") || decodedPassword.endsWith("]"),

      hasSpaces: /\s/.test(decodedPassword),

      hasQuotes:
        decodedPassword.includes('"') || decodedPassword.includes("'"),

      containsPlaceholder:
        decodedPassword.includes("YOUR-PASSWORD") ||
        decodedPassword.includes("YOUR_PASSWORD") ||
        decodedPassword.includes("password"),
    },
  });
}
