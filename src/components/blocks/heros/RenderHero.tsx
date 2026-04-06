import React from "react";

import type { Page } from "@/lib/core/types/payload-types";

import {
  HighImpactHero,
  MediumImpactHero,
  LowImpactHero,
} from "@/components/blocks/heros/impact";

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
};

export const RenderHero: React.FC<Page["hero"]> = (props) => {
  const { type } = props || {};

  if (!type || type === "none") return null;

  const HeroToRender = heroes[type];

  if (!HeroToRender) return null;

  return <HeroToRender {...props} />;
};
