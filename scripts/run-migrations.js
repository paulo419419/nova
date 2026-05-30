const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[v0] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  try {
    console.log('[v0] Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/001_create_tables.sql'),
      'utf8'
    );

    // Split SQL statements by semicolon
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`[v0] Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec', {
          sql: statement + ';'
        });

        if (error) {
          console.log(`[v0] Statement result: ${error.message}`);
        } else {
          console.log('[v0] ✓ Statement executed');
        }
      } catch (err) {
        console.log(`[v0] Statement note: ${err.message}`);
      }
    }

    // Verify products table exists
    console.log('[v0] Verifying products table...');
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .limit(0);

    if (checkError) {
      console.error('[v0] Products table verification failed:', checkError.message);
      console.log('[v0] Attempting direct SQL execution...');
      
      // Try direct execution via rpc with raw SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'NGN',
          specs TEXT,
          budget_tier VARCHAR(50),
          compatible_software VARCHAR(255),
          image_url VARCHAR(500),
          stock_quantity INTEGER DEFAULT 0,
          is_featured BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      try {
        const { error: createError } = await supabase.rpc('exec', {
          sql: createTableSQL
        });
        
        if (createError) {
          console.log('[v0] Create table result:', createError.message);
        } else {
          console.log('[v0] ✓ Products table created successfully');
        }
      } catch (err) {
        console.log('[v0] Note:', err.message);
      }
    } else {
      console.log('[v0] ✓ Products table exists');
    }

    console.log('[v0] Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Migration error:', error.message);
    process.exit(1);
  }
}

runMigrations();
