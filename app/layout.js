import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata = {
  title: "DotBack Admin Dashboard",
  description: "Configure DotBack levels with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
