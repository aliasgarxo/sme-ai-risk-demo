import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/ChatWidget";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "SME AI Risk Register",
  description: "Responsible AI for Canadian Business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
