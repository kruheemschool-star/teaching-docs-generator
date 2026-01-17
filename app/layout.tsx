import type { Metadata } from "next";
import { Sarabun, Mali, Chakra_Petch, Niramit, Charm } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const sarabun = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ["thai", "latin"],
  variable: '--font-sarabun',
});

const mali = Mali({
  weight: ['400', '500', '600', '700'],
  subsets: ["thai", "latin"],
  variable: '--font-mali',
});

const chakraPetch = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  subsets: ["thai", "latin"],
  variable: '--font-chakra',
});

const niramit = Niramit({
  weight: ['400', '500', '600', '700'],
  subsets: ["thai", "latin"],
  variable: '--font-niramit',
});

const charm = Charm({
  weight: ['400', '700'],
  subsets: ["thai", "latin"],
  variable: '--font-charm',
});

export const metadata: Metadata = {
  title: "Teaching Docs Generator",
  description: "Generate A4 teaching documents from JSON",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${sarabun.variable} ${mali.variable} ${chakraPetch.variable} ${niramit.variable} ${charm.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
