import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "UNO Card Game",
  description: "Real-time multiplayer UNO card game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
