import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bierman Family Portal",
  description: "View and book your family's appointments.",
};

// Every page renders per request so it gets a fresh CSP nonce (see proxy.ts)
// and health data is never served from a prebuilt cache.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
