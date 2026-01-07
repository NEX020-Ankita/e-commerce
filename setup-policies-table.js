const { createClient } = require('@supabase/supabase-js');

// You need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupPoliciesTable() {
  try {
    // Create the policies table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS policies (
          id SERIAL PRIMARY KEY,
          product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
          type VARCHAR(20) CHECK (type IN ('refund', 'privacy')) NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_policies_product_id ON policies(product_id);
        CREATE INDEX IF NOT EXISTS idx_policies_type ON policies(type);

        ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Allow public read access" ON policies;
        CREATE POLICY "Allow public read access" ON policies FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Allow authenticated users to manage policies" ON policies;
        CREATE POLICY "Allow authenticated users to manage policies" ON policies FOR ALL USING (true);
      `
    });

    if (error) {
      console.error('Error creating table:', error);
    } else {
      console.log('Policies table created successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

setupPoliciesTable();