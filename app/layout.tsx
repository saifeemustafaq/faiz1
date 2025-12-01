import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { MenuProvider } from "../contexts/MenuContext";
import { RSVPProvider } from "../contexts/RSVPContext";
import { LocationProvider } from "../contexts/LocationContext";
import styles from "./layout.module.css";
import ConditionalLayout from "../components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Community Kitchen Management",
  description: "Manage your community kitchen with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocationProvider>
          <RSVPProvider>
            <MenuProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </MenuProvider>
          </RSVPProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
