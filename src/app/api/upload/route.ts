import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Policy } from '@/lib/policy';
import { getStorage } from '@/server/storage';
import { slugifyFilename } from '@/lib/slug';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  // Auth check
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string }).role;
  if (!Policy.for(userRole).can('section.media')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFilename = slugifyFilename(file.name);
    const datePath = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const filepath = `${datePath}/${Date.now()}-${safeFilename}`;

    const storage = getStorage();
    const storedPath = await storage.upload(filepath, buffer);
    const url = storage.url(storedPath);

    return NextResponse.json({
      filepath: storedPath,
      filename: safeFilename,
      mimeType: file.type,
      fileSize: file.size,
      url,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
