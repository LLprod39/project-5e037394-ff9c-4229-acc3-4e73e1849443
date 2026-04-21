function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export const WHATSAPP_PHONE_DISPLAY =
  import.meta.env.VITE_WHATSAPP_PHONE_DISPLAY || "+7 747 754 97 93";
export const WHATSAPP_PHONE = digitsOnly(
  import.meta.env.VITE_WHATSAPP_PHONE || WHATSAPP_PHONE_DISPLAY
);
export const PHONE_DISPLAY = import.meta.env.VITE_PHONE_DISPLAY || WHATSAPP_PHONE_DISPLAY;
export const INSTAGRAM_URL =
  import.meta.env.VITE_INSTAGRAM_URL ||
  "https://www.instagram.com/umay_kids_pvl?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
export const REVIEWS_URL =
  import.meta.env.VITE_REVIEWS_URL || "https://2gis.kz/pavlodar/geo/70000001104382164";
export const DIAGNOSTIC_FULL_PRICE = Number(import.meta.env.VITE_DIAGNOSTIC_FULL_PRICE || 30000);
export const PAVLODAR_ADDRESS =
  import.meta.env.VITE_ADDRESS || "Павлодар, Толстого 57, 2 этаж, офис 201, вход с цокольного этажа";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
