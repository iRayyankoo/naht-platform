"use client";

import { HomePageContent, Project, SiteSettings } from "@prisma/client";
import ModernHero from "./ModernHero";
import TimedProductCardsHero from "./TimedProductCardsHero";

interface PublicHeroRendererProps {
  content: HomePageContent | null;
  projects: Project[];
  settings: SiteSettings | null;
}

export default function PublicHeroRenderer({ content, projects, settings }: PublicHeroRendererProps) {
  const displayMode = content?.heroDisplayMode || "classic";

  if (displayMode === "timed_product_cards" && projects && projects.length > 0) {
    return <TimedProductCardsHero content={content} projects={projects} settings={settings} />;
  }

  // New modern hero
  return <ModernHero content={content} />;
}
