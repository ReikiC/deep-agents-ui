import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { ApiProvider } from "@/providers/ApiProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={inter.className}
        suppressHydrationWarning
      >
        <NuqsAdapter>
          <AuthProvider>
            <ApiProvider>
              {children}
            </ApiProvider>
          </AuthProvider>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
