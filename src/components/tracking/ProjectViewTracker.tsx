"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/events";

export default function ProjectViewTracker({ projectData }: { projectData: any }) {
  useEffect(() => {
    trackEvent("project_view", projectData);
  }, [projectData]);

  return null;
}
