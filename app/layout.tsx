import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markd — Smart Bookmark Manager",
  description:
    "A fast, private bookmark manager with real-time sync across all your tabs.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔖</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-mesh antialiased">{children}</body>
    </html>
  );
}
