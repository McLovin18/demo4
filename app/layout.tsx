import "./globals.css";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ToastProvider } from "./context/ToastContext";
import LayoutContentClient from "./components/LayoutContentClient";
import { StructuredData } from "./components/StructuredData";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { Inter } from "next/font/google";
import { getSiteSettings } from "./lib/site-settings-db";

// ISR Global: Revalidar sitio cada 30 minutos
// Optimiza regeneración de página principal y otros contenidos estáticos
export const revalidate = 1800;

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant-garamond",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const SITE_URL = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://caramelclothing.ec";
  
  return {
    title: {
      default: settings.seoTitle,
      template: `%s | ${settings.businessName}`,
    },
    description: settings.seoDescription,
    keywords: settings.seoKeywords,
    creator: settings.businessName,
    metadataBase: new URL(SITE_URL),
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",

    // Open Graph - Redes Sociales
    openGraph: {
      type: "website",
      locale: "es_EC",
      url: SITE_URL,
      siteName: settings.businessName,
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: settings.businessName,
          type: "image/jpeg",
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [`${SITE_URL}/twitter-image.jpg`],
    },

    // Canonícal URL
    alternates: {
      canonical: SITE_URL,
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },

    // Verificación
    verification: {
      google: "tu-codigo-google-search-console", // Reemplazar con tu código
    },

    // Apple
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.businessName,
    },

    category: "Moda y Ropa de Baño",
  };
}

// Viewport export - separate from metadata in Next.js 16
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorantGaramond.variable} ${inter.variable}`}>
      <head>
        {/* Google Analytics gtag.js - insertado justo después de <head> */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        {/* ⚠️ Reemplazar G-XXXXXXXXXX con el ID de Analytics propio de Caramel Clothing */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <StructuredData />
      </head>
      <body className="relative">
        <ToastProvider>
          <OnboardingProvider>
            <LayoutContentClient>{children}</LayoutContentClient>
          </OnboardingProvider>
        </ToastProvider>
      </body>
    </html>
  );
}