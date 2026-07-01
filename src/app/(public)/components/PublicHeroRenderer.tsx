"use client";

import { HomePageContent, Project, SiteSettings } from "@prisma/client";
import HeroSection from "./HeroSection";
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

  // Fallback to classic hero
  return <HeroSection content={content} />;
}
