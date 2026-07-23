import { BlogPostForm } from "@/components/admin/BlogPostForm";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Viết bài mới</h1>
      <div className="mt-6">
        <BlogPostForm />
      </div>
    </div>
  );
}
