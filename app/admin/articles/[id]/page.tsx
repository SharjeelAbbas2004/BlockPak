import { AdminPageHeader } from '@/components/admin/ui';
import ArticleForm from '@/components/admin/ArticleForm';

export default function EditArticlePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <AdminPageHeader title="Edit article" description="Update the story and its metadata." />
      <ArticleForm articleId={params.id} />
    </div>
  );
}
