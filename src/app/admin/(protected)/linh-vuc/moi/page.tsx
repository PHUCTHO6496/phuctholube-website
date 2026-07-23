import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { createIndustry, updateIndustry } from "@/lib/actions/admin-industries";

export default function NewIndustryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Thêm lĩnh vực hoạt động</h1>
      <div className="mt-6">
        <TaxonomyForm
          listHref="/admin/linh-vuc"
          createAction={createIndustry}
          updateAction={updateIndustry}
        />
      </div>
    </div>
  );
}
