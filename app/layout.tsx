import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/header";
import "bootstrap/dist/css/bootstrap.min.css";
import { Providers } from "@/store/providers";
import { ToastProvider } from "@/components/ToastMessage";

export const metadata: Metadata = {
  title: "Misc Apps",
  description: "Misc Apps built with Next.js and MongoDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <div className="container mt-3">
            <ToastProvider>{children}</ToastProvider>
          </div>
        </Providers>
      </body>
    </html>
  );
}
