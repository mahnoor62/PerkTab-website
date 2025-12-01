import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata = {
  title: "PerkTap Admin Dashboard",
  description: "Configure PerkTap levels with ease.",
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
