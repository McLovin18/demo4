import { db } from "./firebase-admin";
import { doc, getDoc } from "firebase/firestore";

export interface SiteSettings {
  productWatermarkUrl: string | null;
  businessName: string;
  logoUrl: string | null;
  phoneNumber: string;
  phoneDisplay: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  businessDescription: string[];
  businessAddress: string;
  socialLinks: {
    instagram: string | null;
    tiktok: string | null;
    facebook: string | null;
  };
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  siteUrl: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  productWatermarkUrl: null,
  businessName: "Caramel Clothing",
  logoUrl: null,
  phoneNumber: "",
  phoneDisplay: "",
  whatsappNumber: "593993670958",
  whatsappDisplay: "+593 99 367 0958",
  businessDescription: [
    "Bikini Atelier",
    "14 años creando Alta Costura para Sirenas",
    "Envíos Worldwide"
  ],
  businessAddress: "Hecho en Ecuador",
  socialLinks: {
    instagram: "https://www.instagram.com/caramelclothing/",
    tiktok: null,
    facebook: null,
  },
  seoTitle: "Caramel Clothing | Bikini Atelier, Alta Costura para Sirenas",
  seoDescription: "Caramel Clothing: 14 años creando alta costura en bikinis. Hecho en Ecuador, envíos worldwide. Shop, catálogos, asesoría y workshops.",
  seoKeywords: [
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
  ],
  siteUrl: "https://caramelclothing.ec",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const docRef = doc(db, "landingPage", "main");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        productWatermarkUrl: typeof data.productWatermarkUrl === "string" ? data.productWatermarkUrl : null,
        businessName: typeof data.businessName === "string" ? data.businessName : DEFAULT_SETTINGS.businessName,
        logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : null,
        phoneNumber: typeof data.phoneNumber === "string" ? data.phoneNumber : DEFAULT_SETTINGS.phoneNumber,
        phoneDisplay: typeof data.phoneDisplay === "string" ? data.phoneDisplay : DEFAULT_SETTINGS.phoneDisplay,
        whatsappNumber: typeof data.whatsappNumber === "string" ? data.whatsappNumber : DEFAULT_SETTINGS.whatsappNumber,
        whatsappDisplay: typeof data.whatsappDisplay === "string" ? data.whatsappDisplay : DEFAULT_SETTINGS.whatsappDisplay,
        businessDescription: Array.isArray(data.businessDescription) ? data.businessDescription : DEFAULT_SETTINGS.businessDescription,
        businessAddress: typeof data.businessAddress === "string" ? data.businessAddress : DEFAULT_SETTINGS.businessAddress,
        socialLinks: {
          instagram: typeof data.socialLinks?.instagram === "string" ? data.socialLinks.instagram : DEFAULT_SETTINGS.socialLinks.instagram,
          tiktok: typeof data.socialLinks?.tiktok === "string" ? data.socialLinks.tiktok : DEFAULT_SETTINGS.socialLinks.tiktok,
          facebook: typeof data.socialLinks?.facebook === "string" ? data.socialLinks.facebook : DEFAULT_SETTINGS.socialLinks.facebook,
        },
        seoTitle: typeof data.seoTitle === "string" ? data.seoTitle : DEFAULT_SETTINGS.seoTitle,
        seoDescription: typeof data.seoDescription === "string" ? data.seoDescription : DEFAULT_SETTINGS.seoDescription,
        seoKeywords: Array.isArray(data.seoKeywords) ? data.seoKeywords : DEFAULT_SETTINGS.seoKeywords,
        siteUrl: typeof data.siteUrl === "string" ? data.siteUrl : DEFAULT_SETTINGS.siteUrl,
      };
    }
  } catch (error) {
    console.error("Error fetching site settings:", error);
  }
  
  return DEFAULT_SETTINGS;
}
