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
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
(function(apiKey){
    (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=o._q||[];
    v=['initialize','identify','updateOptions','pageLoad','track','trackAgent'];for(w=0,x=v.length;w<x;++w)(function(m){
    o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
    y=e.createElement(n);y.async=!0;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
    z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
})('6a41f4cc-4485-4417-8534-f7b3c6bf4b23');
` }} />
      </head>
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
