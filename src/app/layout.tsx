import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audit the Bot",
  description: "A classroom simulation for critical evaluation of AI output.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
