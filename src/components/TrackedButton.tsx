"use client";

import { ReactNode } from "react";

export interface ButtonTrackingData {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  deviceType?: string;
  userAgent?: string;
  referrer?: string | null;
  pageUrl?: string;
  visitorId?: string;
  sessionId?: string;
  campaignLinkId?: string | null;
}

interface TrackedButtonProps {
  href: string;
  actionType: "WHATSAPP" | "CALL";
  targetContact: string;
  projectId?: string;
  campaignLinkId?: string;
  children: ReactNode;
  className?: string;
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }
  return `id_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
}

function collectClickTrackingData(campaignLinkIdProp?: string): ButtonTrackingData {
  if (typeof window === "undefined") return {};

  let utmSource: string | null = null;
  let utmMedium: string | null = null;
  let utmCampaign: string | null = null;
  let utmContent: string | null = null;
  let utmTerm: string | null = null;
  let visitorId: string = "";
  let sessionId: string = "";

  try {
    const urlParams = new URLSearchParams(window.location.search);
    utmSource = urlParams.get("utm_source") || null;
    utmMedium = urlParams.get("utm_medium") || null;
    utmCampaign = urlParams.get("utm_campaign") || null;
    utmContent = urlParams.get("utm_content") || null;
    utmTerm = urlParams.get("utm_term") || null;
  } catch {
    // Best-effort
  }

  try {
    const storedVId = localStorage.getItem("visitor_id");
    if (storedVId) {
      visitorId = storedVId;
    } else {
      visitorId = `v_${generateUUID()}`;
      localStorage.setItem("visitor_id", visitorId);
    }
  } catch {
    visitorId = `v_${generateUUID()}`;
  }

  try {
    const storedSId = sessionStorage.getItem("session_id");
    if (storedSId) {
      sessionId = storedSId;
    } else {
      sessionId = `s_${generateUUID()}`;
      sessionStorage.setItem("session_id", sessionId);
    }
  } catch {
    sessionId = `s_${generateUUID()}`;
  }

  return {
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    deviceType: /Mobile|Android|iP(ad|hone)/.test(navigator.userAgent) ? "Mobile" : "Desktop",
    userAgent: navigator.userAgent,
    referrer: document.referrer || null,
    pageUrl: window.location.href,
    visitorId,
    sessionId,
    campaignLinkId: campaignLinkIdProp || null,
  };
}

export default function TrackedButton({
  href,
  actionType,
  targetContact,
  projectId,
  campaignLinkId,
  children,
  className = "",
}: TrackedButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    try {
      const trackingData = collectClickTrackingData(campaignLinkId);

      const payload = {
        actionType,
        targetContact,
        projectId: projectId || null,
        campaignLinkId: campaignLinkId || trackingData.campaignLinkId || null,
        ...trackingData,
      };

      // Attempt beacon for fast offloading
      let beaconSent = false;
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        beaconSent = navigator.sendBeacon("/api/tracking/click", blob);
      } catch {
        beaconSent = false;
      }

      // Trigger external tracking pixels
      import("@/lib/events")
        .then(({ trackEvent }) => {
          trackEvent(actionType === "WHATSAPP" ? "whatsapp_click" : "call_click", {
            projectId: payload.projectId,
            campaignLinkId: payload.campaignLinkId,
            targetContact: payload.targetContact,
          });
        })
        .catch(() => {
          // Ignore tracking pixel error
        });

      if (!beaconSent) {
        // Fallback if beacon fails
        fetch("/api/tracking/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {
          // Ignore fetch tracking error
        });
      }
    } catch {
      // Best-effort tracking; swallow errors
    } finally {
      // Navigation to href MUST be guaranteed in finally block
      window.location.href = href;
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
