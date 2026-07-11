import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Corgan Enterprises — Garage Door Visualizer",
  description:
    "See your new garage door before you buy. Upload a photo of your home and visualize different styles, colours, and window configurations — powered by AI.",
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
