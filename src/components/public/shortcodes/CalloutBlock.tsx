import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  info: 'border-blue-300 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/30 text-blue-900 dark:text-blue-200',
  warning: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/30 text-yellow-900 dark:text-yellow-200',
  success: 'border-green-300 bg-green-50 dark:bg-green-500/10 dark:border-green-500/30 text-green-900 dark:text-green-200',
  error: 'border-red-300 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 text-red-900 dark:text-red-200',
};

interface Props {
  attrs: Record<string, string>;
  content?: string;
}

export function CalloutBlock({ attrs, content }: Props) {
  const type = attrs.type ?? 'info';
  const style = STYLES[type] ?? STYLES.info;

  return (
    <div className={cn('my-4 rounded-md border-l-4 p-4', style)}>
      {content && (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </div>
  );
}
