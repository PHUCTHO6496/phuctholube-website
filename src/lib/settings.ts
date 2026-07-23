import { prisma } from "@/lib/db";
import { SITE } from "@/lib/constants";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  if (!settings) {
    return {
      statYearsValue: "25+",
      statYearsLabel: SITE.name,
      statVolumeValue: "1M",
      statVolumeLabel: "",
      statQualityValue: "100%",
      statQualityLabel: "",
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

export type SiteSettingsData = Awaited<ReturnType<typeof getSiteSettings>>;
