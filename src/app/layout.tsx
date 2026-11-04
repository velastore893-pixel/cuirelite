import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { StoreProvider } from "@/lib/store-context";
import WhatsAppButton from "@/components/store/WhatsAppButton";

export const metadata: Metadata = {
  title: "SIIN OFFICIEL",
  description:
    "Discover SIIN OFFICIEL collections and shop online at siinofficiel.shop.",
  applicationName: "SIIN OFFICIEL",
  keywords:
    "SIIN, SIIN OFFICIEL, fashion, streetwear, clothing, Morocco",
  openGraph: {
    title: "SIIN OFFICIEL",
    description:
      "Discover SIIN OFFICIEL collections at siinofficiel.shop.",
    siteName: "SIIN OFFICIEL",
    url: "https://www.siinofficiel.shop/",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="antialiased">
        <StoreProvider>
          {children}
          <WhatsAppButton />
        </StoreProvider>
      </body>
    </html>
  );
}
