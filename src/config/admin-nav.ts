/**
 * Admin navigation configuration.
 * Single source of truth — imported by AdminSidebar and CommandPalette.
 */
import {
  Activity,
  ArrowRightLeft,
  Calendar,
  ClipboardList,
  FileText,
  FolderOpen,
  Hash,
  Home,
  Image,
  Layers,
  Briefcase,
  ListChecks,
  Mail,
  Menu,
  Settings,
  Upload,
  Users,
  Webhook,
} from 'lucide-react';

export interface NavChild {
  name: string;
  href: string;
  icon: React.ElementType;
}

export interface NavLink {
  id: string;
  name: string;
  href: string;
  icon: React.ElementType;
}

export interface NavGroup {
  id: string;
  name: string;
  icon: React.ElementType;
  children: NavChild[];
}

export type NavItem = NavLink | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

export const navigation: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
  {
    id: 'content',
    name: 'Content',
    icon: FileText,
    children: [
      { name: 'Pages', href: '/dashboard/cms/pages', icon: FileText },
      { name: 'Blog', href: '/dashboard/cms/blog', icon: Layers },
      { name: 'Portfolio', href: '/dashboard/cms/portfolio', icon: Briefcase },
      { name: 'Categories', href: '/dashboard/cms/categories', icon: FolderOpen },
      { name: 'Tags', href: '/dashboard/cms/tags', icon: Hash },
      { name: 'Menus', href: '/dashboard/cms/menus', icon: Menu },
      { name: 'Redirects', href: '/dashboard/cms/redirects', icon: ArrowRightLeft },
      { name: 'Calendar', href: '/dashboard/cms/calendar', icon: Calendar },
    ],
  },
  { id: 'forms', name: 'Forms', href: '/dashboard/forms', icon: ClipboardList },
  { id: 'media', name: 'Media', href: '/dashboard/media', icon: Image },
  { id: 'users', name: 'Users', href: '/dashboard/users', icon: Users },
  { id: 'activity', name: 'Activity', href: '/dashboard/cms/activity', icon: Activity },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/dashboard/settings', icon: Settings },
      { name: 'Custom Fields', href: '/dashboard/settings/custom-fields', icon: Layers },
      { name: 'Import', href: '/dashboard/settings/import', icon: Upload },
      { name: 'Webhooks', href: '/dashboard/settings/webhooks', icon: Webhook },
      { name: 'Job Queue', href: '/dashboard/settings/job-queue', icon: ListChecks },
      { name: 'Email Templates', href: '/dashboard/settings/email-templates', icon: Mail },
    ],
  },
];

/** Flatten navigation into a flat list for search/command palette */
export function flatNavItems(): { name: string; href: string; icon: React.ElementType; group?: string }[] {
  const items: { name: string; href: string; icon: React.ElementType; group?: string }[] = [];
  for (const item of navigation) {
    if (isNavGroup(item)) {
      for (const child of item.children) {
        items.push({ ...child, group: item.name });
      }
    } else {
      items.push(item);
    }
  }
  return items;
}

/**
 * Determine the active section ID from the current pathname.
 * Checks top-level links first, then groups (match child hrefs).
 * This ensures /dashboard/cms/activity matches the 'activity' NavLink,
 * not the 'content' NavGroup (since Activity is a top-level link).
 */
export function getActiveSectionId(pathname: string): string | null {
  // First pass: check top-level links (exact or prefix match)
  // This catches single-page sections like Activity before groups can claim them
  for (const item of navigation) {
    if (!isNavGroup(item)) {
      if (item.href === '/dashboard') {
        if (pathname === '/dashboard') return item.id;
      } else if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        return item.id;
      }
    }
  }

  // Second pass: check groups (match child hrefs)
  for (const item of navigation) {
    if (isNavGroup(item)) {
      for (const child of item.children) {
        if (pathname === child.href || pathname.startsWith(child.href + '/')) {
          return item.id;
        }
      }
    }
  }

  return null;
}

/** Get a nav item by its ID */
export function getNavItem(id: string): NavItem | undefined {
  return navigation.find((item) => item.id === id);
}
