import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { product } from "@/config/product";

export const metadata: Metadata = {
  title: `${product.name} — ${product.tagline}`,
  description: product.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
