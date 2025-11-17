import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

const apiBaseFromEnv =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "";

export const metadata = {
  title: "DotBack Admin Dashboard",
  description: "Configure DotBack levels with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {apiBaseFromEnv ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__DOTBACK_API_BASE__ = ${JSON.stringify(
                apiBaseFromEnv
              )};`,
            }}
          />
        ) : null}
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
