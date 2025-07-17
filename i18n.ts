import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { requestLocale } from './lib/requestLocale';

export default getRequestConfig(async () => {
  const locale = await requestLocale();
  if (!locale) notFound();
  
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    locale
  };
});
