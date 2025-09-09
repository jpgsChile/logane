import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://v0-rifa-pps-mini-app-development.vercel.app';
  return {
    title: "Lo Gane - Rifas Descentralizadas",
    description: "Participa en rifas transparentes en BASE. Hasta 9 premios únicos. ¡Conecta tu wallet y gana!",
    manifest: "/manifest.json",
    themeColor: "#764ba2",
    viewport: "width=device-width, initial-scale=1",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: `${URL}/api/og`,
        button: {
          title: "Launch Lo Gane",
          action: {
            type: "launch_frame",
            name: "Lo Gane",
            url: `${URL}/lo-gane`,
            splashImageUrl: `${URL}/api/og`,
            splashBackgroundColor: "#667eea",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
