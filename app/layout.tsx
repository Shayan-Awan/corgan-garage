import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Corgan Enterprises — AI Room Color Visualizer",
  description:
    "Visualize paint colors in your room with AI-powered recommendations from Corgan Enterprises.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
