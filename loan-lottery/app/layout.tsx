import type { Metadata } from "next";
import { DialogProvider } from "@/components/DialogProvider";
import { Nav } from "@/components/Nav";
import { StoreProvider } from "@/components/StoreProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "خانه شانس",
  description: "قرعه‌کشی لوازم خانگی با خرید بلیط شانس",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800;900&display=swap"
        />
      </head>
      <body>
        <DialogProvider>
          <StoreProvider>
            <Nav />
            <main className="container">{children}</main>
            <footer className="footer">
              شماره برنده با تولید عدد تصادفی امن از بین همه بلیط‌ها انتخاب می‌شود
            </footer>
          </StoreProvider>
        </DialogProvider>
      </body>
    </html>
  );
}
