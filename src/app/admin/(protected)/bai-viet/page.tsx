import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bài viết</h1>
          <p className="mt-1 text-sm text-slate-500">{posts.length} bài viết</p>
        </div>
        <Link
          href="/admin/bai-viet/moi"
          className="inline-flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" /> Viết bài mới
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Tác giả</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{post.title}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{post.author ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs font-semibold " +
                      (post.published
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-500")
                    }
                  >
                    {post.published ? "Đã xuất bản" : "Nháp"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/bai-viet/${post.id}`}
                    className="text-sm font-semibold text-blue-900 hover:text-amber-600"
                  >
                    Sửa
                  </Link>
                  <DeletePostButton id={post.id} title={post.title} />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Chưa có bài viết nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
