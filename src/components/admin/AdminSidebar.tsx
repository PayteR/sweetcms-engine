'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  FolderOpen,
  Hash,
  Home,
  Image,
  Layers,
  Settings,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  {
    name: 'Content',
    children: [
      { name: 'Pages', href: '/dashboard/cms/pages', icon: FileText },
      { name: 'Blog', href: '/dashboard/cms/blog', icon: Layers },
      { name: 'Categories', href: '/dashboard/cms/categories', icon: FolderOpen },
      { name: 'Tags', href: '/dashboard/cms/tags', icon: Hash },
    ],
  },
  { name: 'Media', href: '/dashboard/media', icon: Image },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-(--border-primary) bg-(--surface-primary)">
      <div className="flex h-14 items-center border-b border-(--border-primary) px-4">
        <Link href="/dashboard" className="text-lg font-bold text-(--text-primary)">
          SweetCMS
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navigation.map((item) => {
          if ('children' in item && item.children) {
            return (
              <div key={item.name} className="mt-3">
                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
                  {item.name}
                </p>
                {item.children.map((child) => {
                  const Icon = child.icon;
                  const active = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn('admin-sidebar-link', active && 'active')}
                    >
                      <Icon className="h-4 w-4" />
                      {child.name}
                    </Link>
                  );
                })}
              </div>
            );
          }
          const Icon = item.icon;
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('admin-sidebar-link', active && 'active')}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
