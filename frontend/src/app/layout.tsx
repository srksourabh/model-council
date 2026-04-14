import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Model Council — Don't trust one AI. Let four debate it.",
  description:
    "Four frontier AI models debate your question through 3 structured rounds, then deliver a unified verdict.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
