import { PostgrestError } from '@supabase/supabase-js';

export async function safeFetch<T = any>(
  query: any
): Promise<[T | null, PostgrestError | null]> {
  try {
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return [null, error];
    }
    return [data as T, null];
  } catch (err) {
    console.error('Unexpected error:', err);
    return [null, err as PostgrestError];
  }
}
