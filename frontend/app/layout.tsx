import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js with Lambda Web Adapter Example",
  description:
    "Next.jsをLambda Web Adapterを使ってLambda関数で実行するサンプルアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <script src="/register.js" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
