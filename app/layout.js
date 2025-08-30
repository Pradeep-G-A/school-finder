import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "School Finder",
  description: "Find and add schools to the directory",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Add the suppressHydrationWarning prop to the body tag */}
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
