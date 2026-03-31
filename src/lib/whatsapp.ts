/**
 * WhatsApp Notification Service (Local / Custom API Integration)
 * Migrated from Fonnte to Local WhatsApp API
 */

export interface WhatsAppPayload {
  target: string; // Nomor HP (628xxxx)
  message: string;
  delay?: string; 
  countryCode?: string;
}

export const sendWhatsApp = async (payload: WhatsAppPayload) => {
  const apiUrl = process.env.WHATSAPP_API_URL || "http://localhost:8000/send";
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }

    // Menggunakan URLSearchParams untuk kompatibilitas luas dengan berbagai API Lokal WA
    const body = new URLSearchParams({
      target: payload.target,
      message: payload.message,
      countryCode: payload.countryCode || "62",
    });

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!res.ok) {
      throw new Error(`WhatsApp API responded with status ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada WA Lokal";
    console.error("WhatsApp Local API Error:", error);
    return { success: false, error: errorMessage };
  }
};
