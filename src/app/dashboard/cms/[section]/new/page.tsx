import { notFound } from 'next/navigation';

import { getContentTypeByAdminSlug } from '@/config/cms';
import { PostForm } from '@/components/admin/PostForm';
import { CategoryForm } from '@/components/admin/CategoryForm';

interface Props {
  params: Promise<{ section: string }>;
}

export default async function NewCmsItemPage({ params }: Props) {
  const { section } = await params;
  const contentType = getContentTypeByAdminSlug(section);

  if (!contentType) {
    notFound();
  }

  if (contentType.id === 'category') {
    return <CategoryForm />;
  }

  return <PostForm contentType={contentType} />;
}
