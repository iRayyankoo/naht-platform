"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/events";

export interface ProjectViewTrackerProps {
  projectId?: string;
  projectName?: string;
  projectData?: {
    projectId?: string;
    projectName?: string;
    [key: string]: unknown;
  };
}

export default function ProjectViewTracker({
  projectId: directProjectId,
  projectName: directProjectName,
  projectData,
}: ProjectViewTrackerProps) {
  const trackedIdRef = useRef<string | null>(null);

  const effectiveProjectId = directProjectId || projectData?.projectId || "";
  const effectiveProjectName = directProjectName || projectData?.projectName || "";

  useEffect(() => {
    if (!effectiveProjectId) return;
    if (trackedIdRef.current !== effectiveProjectId) {
      trackedIdRef.current = effectiveProjectId;
      trackEvent("project_view", {
        projectId: effectiveProjectId,
        projectName: effectiveProjectName,
      });
    }
  }, [effectiveProjectId, effectiveProjectName]);

  return null;
}
