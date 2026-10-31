import type { Metadata } from "next";
import { DialogProvider } from "@/components/DialogProvider";
import { FundProvider } from "@/components/FundProvider";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "قرعه‌کشی وام خانگی",
  description: "مدیریت صندوق و قرعه‌کشی وام خانگی و فامیلی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Lalezar&family=Vazirmatn:wght@400;500;700;800&display=swap"
        />
      </head>
      <body>
        <DialogProvider>
        <FundProvider>
          <Nav />
          <main className="container">{children}</main>
          <footer className="footer">
            اطلاعات فقط در همین مرورگر ذخیره می‌شود · از بخش تنظیمات نسخه پشتیبان بگیرید
          </footer>
        </FundProvider>
        </DialogProvider>
      </body>
    </html>
  );
}
