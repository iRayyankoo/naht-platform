"use client";

import { useEffect, useState, ReactNode } from "react";

interface TrackedButtonProps {
  href: string;
  actionType: "WHATSAPP" | "CALL";
  targetContact: string;
  projectId?: string;
  campaignLinkId?: string;
  children: ReactNode;
  className?: string;
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
  const [trackingData, setTrackingData] = useState<any>({});

  useEffect(() => {
    // Collect data once on mount
    const urlParams = new URLSearchParams(window.location.search);
    
    // Attempt to generate a pseudo-visitor ID if none exists
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      visitorId = `v_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      localStorage.setItem("visitor_id", visitorId);
    }

    let sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = `s_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      sessionStorage.setItem("session_id", sessionId);
    }

    setTrackingData({
      utmSource: urlParams.get("utm_source") || null,
      utmMedium: urlParams.get("utm_medium") || null,
      utmCampaign: urlParams.get("utm_campaign") || null,
      utmContent: urlParams.get("utm_content") || null,
      utmTerm: urlParams.get("utm_term") || null,
      deviceType: /Mobile|Android|iP(ad|hone)/.test(navigator.userAgent) ? "Mobile" : "Desktop",
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
      pageUrl: window.location.href,
      visitorId,
      sessionId,
    });
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const payload = {
      actionType,
      targetContact,
      projectId: projectId || null,
      campaignLinkId: campaignLinkId || trackingData.campaignLinkId || null,
      ...trackingData,
    };

    // Attempt beacon for fast offloading
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const beaconSent = navigator.sendBeacon("/api/tracking/click", blob);

    // Trigger external tracking pixels
    import('@/lib/events').then(({ trackEvent }) => {
      trackEvent(actionType === "WHATSAPP" ? "whatsapp_click" : "call_click", {
        projectId: payload.projectId,
        campaignLinkId: payload.campaignLinkId,
        targetContact: payload.targetContact
      });
    }).catch(err => console.error("Error loading tracking events", err));

    if (!beaconSent) {
      // Fallback if beacon fails
      fetch("/api/tracking/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(err => console.error("Fetch tracking error", err));
    }

    // Redirect immediately
    window.location.href = href;
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
