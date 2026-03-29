import { cn } from '@/lib/utils';

const BUTTON_STYLES: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-(--surface-secondary) text-(--text-primary) hover:bg-(--surface-secondary)/80',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10',
};

interface Props {
  attrs: Record<string, string>;
}

function isSafeUrl(url: string): boolean {
  if (url === '#' || url.startsWith('/') || url.startsWith('https://') || url.startsWith('http://')) return true;
  return false;
}

export function CtaBlock({ attrs }: Props) {
  const text = attrs.text ?? 'Click here';
  const rawUrl = attrs.url ?? '#';
  const url = isSafeUrl(rawUrl) ? rawUrl : '#';
  const style = BUTTON_STYLES[attrs.style ?? 'primary'] ?? BUTTON_STYLES.primary;

  return (
    <div className="my-6 text-center">
      <a
        href={url}
        className={cn('inline-block rounded-md px-6 py-3 font-medium transition-colors', style)}
        target={url.startsWith('http') ? '_blank' : undefined}
        rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {text}
      </a>
    </div>
  );
}
