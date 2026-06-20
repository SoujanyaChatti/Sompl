import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { NovusLoader } from "@/components/NovusLoader";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Sompl — The Story Of My Product's Life",
  description:
    "Software has Git. Products don't. Sompl is the living evolutionary record of products — capture, visualize, and learn from why every feature exists. Git tracks code evolution. Sompl tracks product evolution.",
  openGraph: {
    title: "Sompl — The Story Of My Product's Life",
    description: "The living evolutionary record of products and features.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <NovusLoader />
        <StoreProvider>
          <Nav />
          <main className="relative">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
