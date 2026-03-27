import { notFound } from 'next/navigation';

import { getContentTypeByAdminSlug } from '@/config/cms';
import { CmsListView } from '@/components/admin/CmsListView';

interface Props {
  params: Promise<{ section: string }>;
}

export default async function CmsSectionPage({ params }: Props) {
  const { section } = await params;
  const contentType = getContentTypeByAdminSlug(section);

  if (!contentType) {
    notFound();
  }

  return <CmsListView contentType={contentType} />;
}
