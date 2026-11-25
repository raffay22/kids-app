/** Parent-facing site links used in the app footer. */

export const GROWVA_BRAND = "Growva Business";
export const GROWVA_BRAND_URL = "https://growvabusiness.com";

/** Progress / practice log (user wrote “Procedure Tracking”). */
export const PROGRESS_TRACKING_HREF = "/analytics";
export const PROGRESS_TRACKING_LABEL = "Progress Tracking";

export const ABOUT_HREF = "/about";
export const CONTACT_HREF = "/contact";

/**
 * WhatsApp channel / community for latest parenting updates.
 * Override with NEXT_PUBLIC_WHATSAPP_CHANNEL_URL in env when ready.
 */
export const WHATSAPP_CHANNEL_URL =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL) ||
  "https://whatsapp.com/channel/";

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@GrowvaJuniorStudio";

export const NEWSLETTER_HEADING =
  "Parenting tips — please subscribe to our weekly newsletter";

export const WHATSAPP_FOLLOW_LINE =
  "For the latest updates, follow our WhatsApp channel";
