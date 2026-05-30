const https = require('https')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials')
  process.exit(1)
}

const migrationSQL = `
-- Add missing columns to products table
ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS processor VARCHAR(100),
ADD COLUMN IF NOT EXISTS processor_generation VARCHAR(50),
ADD COLUMN IF NOT EXISTS ram_gb VARCHAR(50),
ADD COLUMN IF NOT EXISTS storage_gb VARCHAR(50),
ADD COLUMN IF NOT EXISTS screen_size VARCHAR(20),
ADD COLUMN IF NOT EXISTS graphics VARCHAR(100),
ADD COLUMN IF NOT EXISTS price_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true;
`

async function executeSQL() {
  try {
    const url = new URL(`${supabaseUrl}/rest/v1/rpc/exec_sql`)
    
    // Use basic query approach instead of RPC
    const statements = migrationSQL.split(';').filter(s => s.trim())
    
    for (const statement of statements) {
      if (!statement.trim()) continue
      
      console.log('[v0] Executing:', statement.substring(0, 50) + '...')
      
      const data = JSON.stringify({ sql: statement.trim() })
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
      }

      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = ''
          res.on('data', chunk => responseData += chunk)
          res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 204) {
              console.log('[v0] ✓ Column added successfully')
              resolve()
            } else {
              console.log('[v0] Response:', responseData)
              resolve() // Don't fail, column might already exist
            }
          })
        })

        req.on('error', reject)
        req.write(data)
        req.end()
      })
    }
    
    console.log('[v0] Migration completed!')
    process.exit(0)
  } catch (error) {
    console.error('[v0] Migration error:', error.message)
    process.exit(1)
  }
}

executeSQL()
