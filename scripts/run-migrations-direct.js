const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('[v0] Missing POSTGRES_URL');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('[v0] Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/001_create_tables.sql'),
      'utf8'
    );

    console.log('[v0] Executing migration...');
    const result = await client.query(migrationSQL);
    
    console.log('[v0] ✓ Migration executed successfully');
    
    // Verify tables exist
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('[v0] Tables in database:');
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    if (tableCheck.rows.some(r => r.table_name === 'products')) {
      console.log('[v0] ✓ Products table created successfully!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('[v0] Migration error:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

runMigrations();
