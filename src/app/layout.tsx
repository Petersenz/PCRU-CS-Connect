'use client';

import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

import "./globals.css";
import Navbar from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login');

  return (
    <html lang="th" suppressHydrationWarning>
      <body className={cn(
        inter.className,
        "min-h-screen"
      )}
      style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Pattern */}
          <div className="fixed inset-0 -z-10">
            {/* Light theme background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgb(255,247,237),rgb(255,255,255),rgba(255,247,237,0.3))] dark:bg-[linear-gradient(to_bottom_right,rgb(17,24,39),rgb(31,41,55),rgb(17,24,39))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,26,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,26,0.05),transparent_50%)]" />
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTEyIDBjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
          </div>

          <div className="relative flex min-h-screen flex-col">
            {!isAuthPage && <Navbar />}
            <main className="flex-1">
              {children}
            </main>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}