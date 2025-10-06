import type { Metadata } from "next";
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from "../CartContext";
import Navbar from "../components/navbar";

export const metadata: Metadata = {
  title: "Create Next App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
