import { AdminPageHeader } from '@/components/admin/ui';
import ArticleForm from '@/components/admin/ArticleForm';

export default function NewArticlePage() {
  return (
    <div>
      <AdminPageHeader
        title="New article"
        description="Write and publish a new story for Web3 Pakistan."
      />
      <ArticleForm />
    </div>
  );
}
