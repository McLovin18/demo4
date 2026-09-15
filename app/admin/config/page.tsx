"use client";
import React, { useState, useEffect } from "react";
import { doc, setDoc, onSnapshot, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { uploadImageAndGetUrl } from "../../lib/upload-image";

// Función auxiliar para limpiar datos de undefined recursivamente
function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = cleanUndefined(obj[key]);
      }
    }
    return cleaned;
  }
  
  return obj;
}

import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getInstagramConfig } from "../../lib/instagram-db";

export default function ConfigPage() {
  const colors = {
    bg: "#f8fafc",
    cardBg: "#ffffff",
    accent: "#E0A11A",
    text: "#0f172a",
    border: "#e2e8f0",
  };

  return (
    <div className="px-6 py-6 sm:py-12 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Tema fijo</h2>
        <p className="text-sm text-slate-600 mb-4">
          El sitio usa una sola paleta visual y no permite alternar entre claro y oscuro.
        </p>
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded shadow" style={{ background: colors.bg, border: `2px solid ${colors.border}` }} />
            <span className="text-xs mt-1">Fondo</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded shadow" style={{ background: colors.cardBg, border: `2px solid ${colors.border}` }} />
            <span className="text-xs mt-1">Tarjeta</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded shadow" style={{ background: colors.accent, border: `2px solid ${colors.border}` }} />
            <span className="text-xs mt-1">Acento</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded shadow" style={{ background: colors.text, border: `2px solid ${colors.border}` }} />
            <span className="text-xs mt-1">Texto</span>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-2">Marca de agua</h2>
        <WatermarkSettings />
      </div>

      {/* Información del negocio */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-2">Información del negocio</h2>
        <BusinessInfoSettings />
      </div>

      {/* Información del footer */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-2">Información del footer</h2>
        <FooterInfoSettings />
      </div>

      {/* SEO */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-2">SEO</h2>
        <SEOSettings />
      </div>

      {/* Instagram */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-2">Instagram</h2>
        <InstagramSettings />
      </div>

      {/* Cambiar contraseña */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-2">Cambiar contraseña</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

function WatermarkSettings() {
  const { settings } = useSiteSettings();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSave = async () => {
    setMessage("");
    if (!file) {
      setMessage("Selecciona un archivo PNG primero.");
      return;
    }

    const isPng =
      file.type === "image/png" ||
      file.name.toLowerCase().endsWith(".png");

    if (!isPng) {
      setMessage("La marca de agua debe ser un archivo PNG.");
      return;
    }

    setLoading(true);
    try {
      const path = `landing_page/watermark/watermark_${Date.now()}.png`;
      const url = await uploadImageAndGetUrl(file, path);
      await setDoc(
        doc(db, "landingPage", "main"),
        { productWatermarkUrl: url },
        { merge: true }
      );
      setMessage("Marca de agua guardada correctamente.");
      setFile(null);
    } catch (e: any) {
      setMessage("Error: " + (e?.message || "No se pudo guardar la marca de agua"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setMessage("");
    setLoading(true);
    try {
      await setDoc(
        doc(db, "landingPage", "main"),
        { productWatermarkUrl: null },
        { merge: true }
      );
      setMessage("Marca de agua eliminada.");
    } catch (e: any) {
      setMessage("Error: " + (e?.message || "No se pudo eliminar la marca de agua"));
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = settings.productWatermarkUrl;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Sube un PNG con fondo transparente. Se mostrará abajo a la derecha en las imágenes de productos donde esté activada.
      </p>

      {currentUrl && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-600 mb-2">Actual</div>
          <div className="relative w-44 h-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
            <img src={currentUrl} alt="Marca de agua" className="w-full h-full object-contain p-3" />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <label className="block">
          <span className="block text-sm font-semibold text-slate-700 mb-2">Subir PNG</span>
          <input
            type="file"
            accept="image/png"
            disabled={loading}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base file:mr-4 file:rounded-full file:border-0 file:bg-rose-500 file:px-4 file:py-2 file:text-white file:font-semibold disabled:opacity-60"
          />
        </label>

        {previewUrl && (
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-slate-600 mb-2">Vista previa</div>
            <div className="relative w-44 h-44 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
              <img src={previewUrl} alt="Vista previa" className="w-full h-full object-contain p-3" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !file}
            className="bg-rose-600 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar marca de agua"}
          </button>

          <button
            type="button"
            onClick={handleRemove}
            disabled={loading || !currentUrl}
            className="bg-white text-slate-800 px-4 py-2 rounded-xl font-semibold border border-slate-200 disabled:opacity-60"
          >
            Quitar marca de agua
          </button>
        </div>

        {message && (
          <div className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para Instagram
function InstagramSettings() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await getInstagramConfig();
      setConfig(data);
      setIsAuthorized(!!data.accessToken);
    } catch (error) {
      console.error("Error loading Instagram config:", error);
    }
  };

  const handleAuthorize = () => {
    window.location.href = "/api/instagram/auth";
  };

  const handleUpdateFollowers = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/instagram/update-followers", {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Seguidores actualizados: ${data.followersCount}`);
        await loadConfig();
      } else {
        setMessage("Error: " + (data.error || "No se pudo actualizar seguidores"));
      }
    } catch (error) {
      setMessage("Error de conexión al actualizar seguidores");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("¿Estás seguro de desconectar Instagram?")) return;
    
    setLoading(true);
    try {
      const { saveInstagramConfig } = await import("../../lib/instagram-db");
      await saveInstagramConfig({ accessToken: null, userId: null });
      setMessage("Instagram desconectado");
      await loadConfig();
    } catch (error) {
      setMessage("Error al desconectar Instagram");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Conecta tu cuenta de Instagram para mostrar el número de seguidores en el footer.
      </p>

      {!isAuthorized ? (
        <button
          onClick={handleAuthorize}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-60"
        >
          Autorizar Instagram
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800 font-medium">✓ Instagram autorizado</p>
            {config.expiresAt && (
              <p className="text-xs text-green-600 mt-1">
                Token expira: {new Date(config.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Seguidores actuales</p>
                <p className="text-2xl font-bold text-blue-900">
                  {config.followersCount || 0}
                </p>
                {config.lastUpdated && (
                  <p className="text-xs text-blue-600">
                    Actualizado: {new Date(config.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleUpdateFollowers}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-60"
              >
                {loading ? "Actualizando..." : "Actualizar seguidores"}
              </button>
            </div>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="bg-white text-red-600 px-4 py-2 rounded-xl font-semibold border border-red-200 disabled:opacity-60"
          >
            Desconectar Instagram
          </button>
        </div>
      )}

      {message && (
        <div className={`text-sm p-3 rounded-xl ${
          message.startsWith("Error") 
            ? "bg-red-50 text-red-700 border border-red-200" 
            : "bg-green-50 text-green-700 border border-green-200"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-xs text-yellow-800">
          <strong>Nota importante:</strong> Para obtener el número real de seguidores necesitas:
          1) Una cuenta de Instagram Business, 2) Permisos de Instagram Graph API, 
          3) Aprobación de la aplicación por Meta. Con la API básica actual, se mostrará el conteo de publicaciones como placeholder.
        </p>
      </div>
    </div>
  );
}

// Componente para cambiar contraseña
function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Por favor completa todos los campos.");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Usuario no autenticado");
      // Reautenticación
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      // Cambiar contraseña
      await updatePassword(user, newPassword);
      setMessage("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setMessage("Error: " + (e.message || "No se pudo cambiar la contraseña"));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Contraseña actual</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirmar nueva contraseña</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Cambiando..." : "Cambiar contraseña"}
      </button>
      {message && (
        <div className={`mt-2 text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>{message}</div>
      )}
    </form>
  );
}


// Componente para información del negocio
function BusinessInfoSettings() {
  const { settings } = useSiteSettings();
  const [businessName, setBusinessName] = useState(settings.businessName || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl || null);
  const [phoneNumber, setPhoneNumber] = useState(settings.phoneNumber || "");
  const [phoneDisplay, setPhoneDisplay] = useState(settings.phoneDisplay || "");
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || "");
  const [whatsappDisplay, setWhatsappDisplay] = useState(settings.whatsappDisplay || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBusinessName(settings.businessName || "");
    setLogoPreview(settings.logoUrl || null);
    setPhoneNumber(settings.phoneNumber || "");
    setPhoneDisplay(settings.phoneDisplay || "");
    setWhatsappNumber(settings.whatsappNumber || "");
    setWhatsappDisplay(settings.whatsappDisplay || "");
  }, [settings]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const handleSave = async () => {
    setMessage("");
    setLoading(true);
    try {
      let logoUrl = settings.logoUrl;
      
      if (logoFile) {
        const path = `landing_page/logo/logo_${Date.now()}.${logoFile.name.split('.').pop()}`;
        logoUrl = await uploadImageAndGetUrl(logoFile, path);
      }

      const dataToUpdate: Record<string, any> = {
        businessName,
        phoneNumber,
        phoneDisplay,
        whatsappNumber,
        whatsappDisplay,
      };

      if (logoUrl !== null) {
        dataToUpdate.logoUrl = logoUrl;
      }

      // Limpiar undefined recursivamente
      const cleanedData = cleanUndefined(dataToUpdate);

      await setDoc(
        doc(db, "landingPage", "main"),
        cleanedData,
        { merge: true }
      );
      setMessage("Información del negocio guardada correctamente.");
      setLogoFile(null);
    } catch (e: any) {
      setMessage("Error: " + (e?.message || "No se pudo guardar la información"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del negocio</label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Número de teléfono</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
            placeholder="Solo números, con código de país"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Teléfono (display)</label>
          <input
            type="text"
            value={phoneDisplay}
            onChange={(e) => setPhoneDisplay(e.target.value)}
            disabled={loading}
            placeholder="Como se muestra al usuario"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp (número)</label>
          <input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            disabled={loading}
            placeholder="Solo números, con código de país"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp (display)</label>
          <input
            type="text"
            value={whatsappDisplay}
            onChange={(e) => setWhatsappDisplay(e.target.value)}
            disabled={loading}
            placeholder="Como se muestra al usuario"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Logo</label>
        <input
          type="file"
          accept="image/*"
          disabled={loading}
          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base file:mr-4 file:rounded-full file:border-0 file:bg-rose-500 file:px-4 file:py-2 file:text-white file:font-semibold disabled:opacity-60"
        />
      </div>

      {logoPreview && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="text-xs font-semibold text-slate-600 mb-2">Vista previa</div>
          <img src={logoPreview} alt="Logo preview" className="max-h-32 object-contain" />
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="bg-rose-600 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar información"}
      </button>

      {message && (
        <div className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </div>
      )}
    </div>
  );
}

// Componente para información del footer
function FooterInfoSettings() {
  const { settings } = useSiteSettings();
  const [businessDescription, setBusinessDescription] = useState(settings.businessDescription?.join("\n") || "");
  const [businessAddress, setBusinessAddress] = useState(settings.businessAddress || "");
  const [instagram, setInstagram] = useState(settings.socialLinks?.instagram || "");
  const [tiktok, setTiktok] = useState(settings.socialLinks?.tiktok || "");
  const [facebook, setFacebook] = useState(settings.socialLinks?.facebook || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBusinessDescription(settings.businessDescription?.join("\n") || "");
    setBusinessAddress(settings.businessAddress || "");
    setInstagram(settings.socialLinks?.instagram || "");
    setTiktok(settings.socialLinks?.tiktok || "");
    setFacebook(settings.socialLinks?.facebook || "");
  }, [settings]);

  const handleSave = async () => {
    setMessage("");
    setLoading(true);
    try {
      const descriptionLines = businessDescription.split("\n").filter(line => line.trim());

      const dataToUpdate: Record<string, any> = {
        businessDescription: descriptionLines,
        businessAddress,
        socialLinks: {
          instagram: instagram || null,
          tiktok: tiktok || null,
          facebook: facebook || null,
        },
      };

      // Limpiar undefined recursivamente
      const cleanedData = cleanUndefined(dataToUpdate);

      await setDoc(
        doc(db, "landingPage", "main"),
        cleanedData,
        { merge: true }
      );
      setMessage("Información del footer guardada correctamente.");
    } catch (e: any) {
      setMessage("Error: " + (e?.message || "No se pudo guardar la información"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción del negocio (una línea por párrafo)</label>
        <textarea
          value={businessDescription}
          onChange={(e) => setBusinessDescription(e.target.value)}
          disabled={loading}
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Dirección</label>
        <input
          type="text"
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Instagram URL</label>
          <input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            disabled={loading}
            placeholder="https://instagram.com/..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">TikTok URL</label>
          <input
            type="url"
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            disabled={loading}
            placeholder="https://tiktok.com/..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Facebook URL</label>
          <input
            type="url"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            disabled={loading}
            placeholder="https://facebook.com/..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="bg-rose-600 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar información"}
      </button>

      {message && (
        <div className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </div>
      )}
    </div>
  );
}

// Componente para SEO
function SEOSettings() {
  const { settings } = useSiteSettings();
  const [seoTitle, setSeoTitle] = useState(settings.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(settings.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(settings.seoKeywords?.join(", ") || "");
  const [siteUrl, setSiteUrl] = useState(settings.siteUrl || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSeoTitle(settings.seoTitle || "");
    setSeoDescription(settings.seoDescription || "");
    setSeoKeywords(settings.seoKeywords?.join(", ") || "");
    setSiteUrl(settings.siteUrl || "");
  }, [settings]);

  const handleSave = async () => {
    setMessage("");
    setLoading(true);
    try {
      const keywordsArray = seoKeywords.split(",").map(k => k.trim()).filter(k => k);

      const dataToUpdate: Record<string, any> = {
        seoTitle,
        seoDescription,
        seoKeywords: keywordsArray,
        siteUrl,
      };

      // Limpiar undefined recursivamente
      const cleanedData = cleanUndefined(dataToUpdate);

      // Primero eliminar campos problematicos del documento existente
      try {
        await updateDoc(doc(db, "landingPage", "main"), {
          seoOgImage: deleteField(),
        });
      } catch (e) {
        // Ignorar si el campo no existe
      }

      await setDoc(
        doc(db, "landingPage", "main"),
        cleanedData,
        { merge: true }
      );
      setMessage("Configuración SEO guardada correctamente.");
    } catch (e: any) {
      setMessage("Error: " + (e?.message || "No se pudo guardar la configuración SEO"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Título SEO</label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción SEO</label>
        <textarea
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          disabled={loading}
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Keywords (separados por coma)</label>
        <input
          type="text"
          value={seoKeywords}
          onChange={(e) => setSeoKeywords(e.target.value)}
          disabled={loading}
          placeholder="keyword1, keyword2, keyword3"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">URL del sitio</label>
        <input
          type="url"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          disabled={loading}
          placeholder="https://tu-sitio.com"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base disabled:opacity-60"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="bg-rose-600 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar configuración SEO"}
      </button>

      {message && (
        <div className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </div>
      )}
    </div>
  );
}
