"use client";

import { HomePageContent } from "@prisma/client";
import HeroSection from "./HeroSection";

export default function PublicHeroRenderer({ content }: { content: HomePageContent | null }) {
  const displayMode = content?.heroDisplayMode || "classic";

  if (displayMode === "timed_product_cards") {
    // TODO: In Phase 6B-2 or 6B-3, we will render <TimedProductCardsHero content={content} /> here.
    // For now, we fallback to the classic hero to ensure the site doesn't break.
    return <HeroSection content={content} />;
  }

  // Fallback to classic hero
  return <HeroSection content={content} />;
}
