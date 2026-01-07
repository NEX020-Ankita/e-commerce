-- Create policies table
CREATE TABLE policies (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('refund', 'privacy')) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_policies_product_id ON policies(product_id);
CREATE INDEX idx_policies_type ON policies(type);

-- Enable RLS (Row Level Security)
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON policies
FOR SELECT USING (true);

-- Create policy for authenticated users to manage policies (admin only)
CREATE POLICY "Allow authenticated users to manage policies" ON policies
FOR ALL USING (auth.role() = 'authenticated');