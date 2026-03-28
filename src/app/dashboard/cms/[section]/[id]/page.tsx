import { notFound } from 'next/navigation';

import { getContentTypeByAdminSlug } from '@/config/cms';
import { PostForm } from '@/components/admin/PostForm';
import { CategoryForm } from '@/components/admin/CategoryForm';

interface Props {
  params: Promise<{ section: string; id: string }>;
}

export default async function EditCmsItemPage({ params }: Props) {
  const { section, id } = await params;
  const contentType = getContentTypeByAdminSlug(section);

  if (!contentType) {
    notFound();
  }

  if (contentType.id === 'category') {
    return <CategoryForm categoryId={id} />;
  }

  return <PostForm contentType={contentType} postId={id} />;
}
