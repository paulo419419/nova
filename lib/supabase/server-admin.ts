import { createClient } from '@supabase/supabase-js'

/**
 * Admin client for Supabase - uses service role key for privileged operations
 * Only use this in API routes for admin-only operations
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
