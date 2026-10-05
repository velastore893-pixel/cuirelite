import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { StoreProvider } from "@/lib/store-context";
import WhatsAppButton from "@/components/store/WhatsAppButton";

export const metadata: Metadata = {
  title: "CUIR ELITE | Premium Leather Jackets for Women",
  description:
    "Discover our collection of premium leather jackets, blazers, and accessories for the modern woman. Handcrafted from the finest genuine leather.",
  keywords:
    "leather jackets, women fashion, cuir, blazers, biker jackets",
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
