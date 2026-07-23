import { TaxonomyForm } from "@/components/admin/TaxonomyForm";
import { createCategory, updateCategory } from "@/lib/actions/admin-categories";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Thêm danh mục</h1>
      <div className="mt-6">
        <TaxonomyForm
          listHref="/admin/danh-muc"
          createAction={createCategory}
          updateAction={updateCategory}
        />
      </div>
    </div>
  );
}
