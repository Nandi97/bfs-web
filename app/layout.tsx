import type { Metadata } from "next";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { fontVariables } from "@/lib/font";
import { cn } from "@/lib/utils";

import "./globals.css";

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export const metadata: Metadata = {
  title: "BFS Dashboard",
  description: "Starter-aligned operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content={META_THEME_COLORS.light} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (
                  localStorage.theme === 'dark' ||
                  ((!('theme' in localStorage) || localStorage.theme === 'system') &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches)
                ) {
                  document
                    .querySelector('meta[name="theme-color"]')
                    .setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background overflow-hidden overscroll-none font-sans antialiased",
          "theme-default",
          fontVariables,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
