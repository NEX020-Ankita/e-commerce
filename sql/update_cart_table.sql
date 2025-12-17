-- Add product details columns to cart table
ALTER TABLE cart 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Update existing cart items with product details
UPDATE cart 
SET 
  title = product.title,
  price = product.price,
  image_urls = product.image_urls
FROM product 
WHERE cart.product_id = product.id;