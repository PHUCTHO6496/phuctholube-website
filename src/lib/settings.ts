import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";

const SETTINGS_SELECT = {
  logoUrl: true,
  heroImageUrl: true,
  galleryImages: true,
  statYearsValue: true,
  statYearsLabel: true,
  statYearsLabelEn: true,
  statVolumeValue: true,
  statVolumeLabel: true,
  statVolumeLabelEn: true,
  statQualityValue: true,
  statQualityLabel: true,
  statQualityLabelEn: true,
  address: true,
  phone: true,
  email: true,
  zaloUrl: true,
  facebookUrl: true,
  linkedinUrl: true,
  hoursMonFri: true,
  hoursSat: true,
  hoursSun: true,
} as const;

async function fetchSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: SETTINGS_SELECT,
  });

  if (!settings) {
    return {
      logoUrl: null,
      heroImageUrl: null,
      galleryImages: [] as string[],
      statYearsValue: "25+",
      statYearsLabel: SITE.name,
      statYearsLabelEn: null,
      statVolumeValue: "1M",
      statVolumeLabel: "",
      statVolumeLabelEn: null,
      statQualityValue: "100%",
      statQualityLabel: "",
      statQualityLabelEn: null,
      address: SITE.address,
      phone: SITE.phone,
      email: SITE.email,
      zaloUrl: SITE.zaloUrl,
      facebookUrl: null,
      linkedinUrl: null,
      hoursMonFri: SITE.hours[0].time,
      hoursSat: SITE.hours[1].time,
      hoursSun: SITE.hours[2].time,
    };
  }

  return settings;
}

export const getSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings"], {
  tags: ["settings"],
  revalidate: 300,
});

export type SiteSettingsData = Awaited<ReturnType<typeof getSiteSettings>>;
