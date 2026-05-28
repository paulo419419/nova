import { createAdminClient } from '@/lib/supabase/server-admin'

export async function initializeDatabase() {
  const supabase = createAdminClient()

  try {
    // Check if tables exist by querying information_schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (tablesError) {
      console.error('Error checking tables:', tablesError)
      return false
    }

    const tableNames = tables?.map((t: any) => t.table_name) || []

    // Log current tables
    console.log('Existing tables:', tableNames)

    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}

export async function checkProductsTable() {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact' })
      .limit(1)

    if (error) {
      console.error('Products table error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking products table:', error)
    return false
  }
}
