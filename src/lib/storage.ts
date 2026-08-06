import { supabase } from './supabase';

const BUCKET_NAME = 'media';
const SUPABASE_STORAGE_BASE_URL = `${(import.meta as any).env?.VITE_SUPABASE_URL || 'https://txmaffxbrmxlzakxathe.supabase.co'}/storage/v1/object/public/${BUCKET_NAME}`;

/**
 * Returns the public Supabase Storage CDN URL for a given relative media path.
 * Example: getMediaUrl('bg/02.webm') -> 'https://txmaffxbrmxlzakxathe.supabase.co/storage/v1/object/public/media/bg/02.webm'
 */
export function getMediaUrl(relativePath: string): string {
  const cleanPath = relativePath.replace(/^\/?(img\/)?/, '');
  
  if (supabase) {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(cleanPath);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }
  
  return `${SUPABASE_STORAGE_BASE_URL}/${cleanPath}`;
}
