"use client";

import { useStore } from "@/lib/store-context";

export default function WhatsAppButton() {
  const { settings } = useStore();

  const enabled = settings.whatsapp_enabled === "true";
  const number = settings.whatsapp_number || "";
  const message =
    settings.whatsapp_message ||
    "Hello, I am interested in your products.";

  if (!enabled || !number) return null;

  const cleanNumber = number.replace(/[^\d]/g, "");

  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 right-5 z-[9999] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
    >
      <svg
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="currentColor"
      >
        <path d="M16.04 3C9.42 3 4.03 8.31 4.03 14.84c0 2.1.56 4.15 1.63 5.94L4 27l6.39-1.66a12.1 12.1 0 0 0 5.64 1.42h.01c6.62 0 12.01-5.31 12.01-11.84C28.05 8.31 22.66 3 16.04 3Zm0 21.76h-.01c-1.77 0-3.51-.47-5.03-1.37l-.36-.21-3.79.98 1.01-3.65-.24-.37a9.76 9.76 0 0 1-1.51-5.3C6.11 9.41 10.56 5 16.04 5c5.48 0 9.93 4.41 9.93 9.84 0 5.43-4.45 9.92-9.93 9.92Zm5.45-7.38c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.29-.77.96-.94 1.15-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.78-1.49-1.75-1.66-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.51-.08-.15-.67-1.59-.92-2.18-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.04 1.01-1.04 2.47 0 1.45 1.07 2.86 1.22 3.05.15.2 2.1 3.17 5.09 4.45.71.3 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.08 1.76-.71 2.01-1.39.25-.69.25-1.28.17-1.4-.07-.12-.27-.19-.57-.34Z" />
      </svg>
    </a>
  );
}
