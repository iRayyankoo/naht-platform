/**
 * Event Tracking Helper
 * المركز الأساسي لإطلاق الأحداث نحو مختلف المنصات (GTM, Meta, TikTok, etc.)
 */

// Declare global variables for various pixels
declare global {
  interface Window {
    dataLayer: any[];
    fbq?: (...args: any[]) => void;
    ttq?: { track: (event: string, data?: any) => void };
    snaptr?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    lintrk?: (action: string, data?: any) => void;
  }
}

export const trackEvent = (eventName: string, eventData: any = {}) => {
  // 1. Google Tag Manager (dataLayer)
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
  }

  // Map our internal event names to standard pixel events
  let fbEventName = "CustomEvent";
  let ttEventName = "CustomEvent";
  let snapEventName = "CUSTOM_EVENT";

  switch (eventName) {
    case "form_submit":
    case "lead_created":
      fbEventName = "Lead";
      ttEventName = "SubmitForm";
      snapEventName = "SIGN_UP";
      break;
    case "whatsapp_click":
    case "call_click":
      fbEventName = "Contact";
      ttEventName = "Contact";
      snapEventName = "CONTACT";
      break;
    case "project_view":
      fbEventName = "ViewContent";
      ttEventName = "ViewContent";
      snapEventName = "VIEW_CONTENT";
      break;
    case "thank_you_page_view":
      fbEventName = "CompleteRegistration";
      ttEventName = "CompleteRegistration";
      snapEventName = "SIGN_UP"; // Or PAGE_VIEW
      break;
  }

  // 2. Meta Pixel (Facebook)
  if (typeof window !== "undefined" && window.fbq) {
    const isStandard = ["Lead", "Contact", "ViewContent", "CompleteRegistration"].includes(fbEventName);
    if (isStandard) {
      window.fbq("track", fbEventName, eventData);
    } else {
      window.fbq("trackCustom", eventName, eventData);
    }
  }

  // 3. TikTok Pixel
  if (typeof window !== "undefined" && window.ttq) {
    window.ttq.track(ttEventName, eventData);
  }

  // 4. Snapchat Pixel
  if (typeof window !== "undefined" && window.snaptr) {
    window.snaptr("track", snapEventName, eventData);
  }

  // Note: GA4 and Google Ads will usually pick up events automatically from GTM 
  // if GTM is configured. If not, gtag can be used:
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventData);
  }
};
