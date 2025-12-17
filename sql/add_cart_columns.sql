-- Add cart-related columns to product table
ALTER TABLE product 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_cart_item BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_user_cart ON product(user_id, is_cart_item) WHERE is_cart_item = TRUE;