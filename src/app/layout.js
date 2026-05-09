import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientProvider from "@/components/ClientProvider/ClientProvider";

const interSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interMono = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],

});

export const metadata = {
  title: "AI Powered Project Management System",
  description: "AI Powered Project Management System for the modern era",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${interSans.variable} ${interMono.variable} antialiased`}
      >
        <ClientProvider
        >
          {children}
        </ClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
