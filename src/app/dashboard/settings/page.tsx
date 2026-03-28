'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { useBlankTranslations } from '@/lib/translations';
import { toast } from '@/store/toast-store';

interface SiteSettings {
  'site.name': string;
  'site.tagline': string;
  'site.description': string;
  'site.url': string;
  'site.logo': string;
  'site.favicon': string;
  'site.social.twitter': string;
  'site.social.github': string;
  'site.analytics.ga_id': string;
  'site.posts_per_page': number;
  'site.allow_registration': boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  'site.name': '',
  'site.tagline': '',
  'site.description': '',
  'site.url': '',
  'site.logo': '',
  'site.favicon': '',
  'site.social.twitter': '',
  'site.social.github': '',
  'site.analytics.ga_id': '',
  'site.posts_per_page': 10,
  'site.allow_registration': true,
};

export default function SettingsPage() {
  const __ = useBlankTranslations();
  const utils = trpc.useUtils();

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const allOptions = trpc.options.getAll.useQuery();
  const setMany = trpc.options.setMany.useMutation({
    onSuccess: () => {
      toast.success(__('Settings saved'));
      utils.options.getAll.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (allOptions.data && !loaded) {
      const data = allOptions.data as Record<string, unknown>;
      setSettings((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
          if (key in data) {
            (next as Record<string, unknown>)[key] = data[key];
          }
        }
        return next;
      });
      setLoaded(true);
    }
  }, [allOptions.data, loaded]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMany.mutate({ options: settings as unknown as Record<string, unknown> });
  }

  function updateField(key: keyof SiteSettings, value: string | number | boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (allOptions.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{__('Settings')}</h1>
        <button
          type="submit"
          form="settings-form"
          disabled={setMany.isPending}
          className="admin-btn admin-btn-primary disabled:opacity-50"
        >
          {setMany.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {__('Save')}
        </button>
      </div>

      <form id="settings-form" onSubmit={handleSave} className="mt-6 space-y-6">
        {/* General */}
        <div className="admin-card p-6">
          <h2 className="admin-h2">{__('General')}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Site Name')}
              </label>
              <input
                type="text"
                value={settings['site.name']}
                onChange={(e) => updateField('site.name', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="My Website"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Tagline')}
              </label>
              <input
                type="text"
                value={settings['site.tagline']}
                onChange={(e) => updateField('site.tagline', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={__('A brief description of your site')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Description')}
              </label>
              <textarea
                value={settings['site.description']}
                onChange={(e) => updateField('site.description', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Site URL')}
              </label>
              <input
                type="url"
                value={settings['site.url']}
                onChange={(e) => updateField('site.url', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="admin-card p-6">
          <h2 className="admin-h2">{__('Branding')}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Logo URL')}
              </label>
              <input
                type="text"
                value={settings['site.logo']}
                onChange={(e) => updateField('site.logo', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://..."
              />
              {settings['site.logo'] && (
                <img
                  src={settings['site.logo']}
                  alt="Logo preview"
                  className="mt-2 h-12 object-contain"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Favicon URL')}
              </label>
              <input
                type="text"
                value={settings['site.favicon']}
                onChange={(e) => updateField('site.favicon', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Social & Analytics */}
        <div className="admin-card p-6">
          <h2 className="admin-h2">{__('Social & Analytics')}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Twitter / X Handle')}
              </label>
              <input
                type="text"
                value={settings['site.social.twitter']}
                onChange={(e) => updateField('site.social.twitter', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="@yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('GitHub URL')}
              </label>
              <input
                type="text"
                value={settings['site.social.github']}
                onChange={(e) => updateField('site.social.github', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Google Analytics ID')}
              </label>
              <input
                type="text"
                value={settings['site.analytics.ga_id']}
                onChange={(e) => updateField('site.analytics.ga_id', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Reading */}
        <div className="admin-card p-6">
          <h2 className="admin-h2">{__('Reading')}</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {__('Posts per page')}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={settings['site.posts_per_page']}
                onChange={(e) =>
                  updateField('site.posts_per_page', Number(e.target.value))
                }
                className="mt-1 block w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings['site.allow_registration']}
                onChange={(e) =>
                  updateField('site.allow_registration', e.target.checked)
                }
                className="rounded border-gray-300"
              />
              {__('Allow user registration')}
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
