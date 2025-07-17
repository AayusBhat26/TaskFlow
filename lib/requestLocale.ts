import { headers } from 'next/headers';

export async function requestLocale() {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';
  
  // Extract locale from pathname (assuming locale is the first segment)
  const segments = pathname.split('/');
  const locale = segments[1];
  
  // Check if locale is valid (you can add more validation here)
  if (locale === 'en' || locale === 'te') {
    return locale;
  }
  
  // Default to 'en' if no valid locale found
  return 'en';
} 