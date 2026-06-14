"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/events";

export default function ThankYouTracker({ eventData = {} }: { eventData?: any }) {
  useEffect(() => {
    trackEvent("thank_you_page_view", eventData);
    trackEvent("lead_created", eventData);
  }, [eventData]);

  return null;
}
