"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

type SiteSettings = {
  productWatermarkUrl: string | null;
  // Información del negocio
  businessName: string;
  logoUrl: string | null;
  phoneNumber: string;
  phoneDisplay: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  // Información del footer
  businessDescription: string[];
  businessAddress: string;
  socialLinks: {
    instagram: string | null;
    tiktok: string | null;
    facebook: string | null;
  };
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  siteUrl: string;
};

type SiteSettingsContextType = {
  settings: SiteSettings;
  loading: boolean;
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [productWatermarkUrl, setProductWatermarkUrl] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("Caramel Clothing");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("593993670958");
  const [whatsappDisplay, setWhatsappDisplay] = useState("+593 99 367 0958");
  const [businessDescription, setBusinessDescription] = useState<string[]>([
    "Bikini Atelier",
    "14 años creando Alta Costura para Sirenas",
    "Envíos Worldwide"
  ]);
  const [businessAddress, setBusinessAddress] = useState("Hecho en Ecuador");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "https://www.instagram.com/caramelclothing/",
    tiktok: null,
    facebook: null,
  });
  const [seoTitle, setSeoTitle] = useState("Caramel Clothing | Bikini Atelier, Alta Costura para Sirenas");
  const [seoDescription, setSeoDescription] = useState("Caramel Clothing: 14 años creando alta costura en bikinis. Hecho en Ecuador, envíos worldwide. Shop, catálogos, asesoría y workshops.");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([
    "bikinis a medida Ecuador",
    "alta costura bikinis",
    "bikini atelier",
    "Caramel Clothing",
    "trajes de baño artesanales",
    "moda de baño Ecuador",
    "envíos worldwide bikinis",
    "workshops de costura Ecuador",
    "ropa de baño hecha a mano",
    "emprendimiento femenino Ecuador",
  ]);
  const [siteUrl, setSiteUrl] = useState("https://caramelclothing.ec");

  useEffect(() => {
    const ref = doc(db, "landingPage", "main");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = (snap.data() || {}) as Record<string, unknown>;
        
        // Cargar campos existentes
        const url = typeof data.productWatermarkUrl === "string" ? data.productWatermarkUrl : null;
        setProductWatermarkUrl(url);
        
        // Cargar nuevos campos de configuración
        if (typeof data.businessName === "string") setBusinessName(data.businessName);
        if (typeof data.logoUrl === "string") setLogoUrl(data.logoUrl);
        if (typeof data.phoneNumber === "string") setPhoneNumber(data.phoneNumber);
        if (typeof data.phoneDisplay === "string") setPhoneDisplay(data.phoneDisplay);
        if (typeof data.whatsappNumber === "string") setWhatsappNumber(data.whatsappNumber);
        if (typeof data.whatsappDisplay === "string") setWhatsappDisplay(data.whatsappDisplay);
        
        if (Array.isArray(data.businessDescription)) setBusinessDescription(data.businessDescription);
        if (typeof data.businessAddress === "string") setBusinessAddress(data.businessAddress);
        
        if (typeof data.socialLinks === "object" && data.socialLinks !== null) {
          const links = data.socialLinks as Record<string, unknown>;
          setSocialLinks({
            instagram: typeof links.instagram === "string" ? links.instagram : null,
            tiktok: typeof links.tiktok === "string" ? links.tiktok : null,
            facebook: typeof links.facebook === "string" ? links.facebook : null,
          });
        }
        
        if (typeof data.seoTitle === "string") setSeoTitle(data.seoTitle);
        if (typeof data.seoDescription === "string") setSeoDescription(data.seoDescription);
        if (Array.isArray(data.seoKeywords)) setSeoKeywords(data.seoKeywords);
        if (typeof data.siteUrl === "string") setSiteUrl(data.siteUrl);
        
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const value = useMemo<SiteSettingsContextType>(() => {
    return {
      loading,
      settings: {
        productWatermarkUrl,
        businessName,
        logoUrl,
        phoneNumber,
        phoneDisplay,
        whatsappNumber,
        whatsappDisplay,
        businessDescription,
        businessAddress,
        socialLinks,
        seoTitle,
        seoDescription,
        seoKeywords,
        siteUrl,
      },
    };
  }, [loading, productWatermarkUrl, businessName, logoUrl, phoneNumber, phoneDisplay, whatsappNumber, whatsappDisplay, businessDescription, businessAddress, socialLinks, seoTitle, seoDescription, seoKeywords, siteUrl]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextType {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return ctx;
}

