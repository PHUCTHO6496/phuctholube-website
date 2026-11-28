import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Cài đặt website</h1>
      <p className="mt-1 text-sm text-slate-500">
        Thông tin này hiển thị trên trang chủ, chân trang và trang liên hệ.
      </p>
      <div className="mt-6">
        <SettingsForm
          initialData={{
            ...settings,
            logoUrl: settings.logoUrl ?? "",
            heroImageUrl: settings.heroImageUrl ?? "",
            statYearsLabelEn: settings.statYearsLabelEn ?? "",
            statYearsLabelZh: settings.statYearsLabelZh ?? "",
            statVolumeLabelEn: settings.statVolumeLabelEn ?? "",
            statVolumeLabelZh: settings.statVolumeLabelZh ?? "",
            statQualityLabelEn: settings.statQualityLabelEn ?? "",
            statQualityLabelZh: settings.statQualityLabelZh ?? "",
            facebookUrl: settings.facebookUrl ?? "",
            linkedinUrl: settings.linkedinUrl ?? "",
            leadGuidePdfUrl: settings.leadGuidePdfUrl ?? "",
          }}
        />
      </div>
    </div>
  );
}
