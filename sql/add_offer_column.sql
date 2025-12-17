-- Add offer_percentage column to product table
ALTER TABLE product 
ADD COLUMN offer_percentage DECIMAL(5,2) CHECK (offer_percentage >= 0 AND offer_percentage <= 100);

-- Add comment to the column
COMMENT ON COLUMN product.offer_percentage IS 'Discount percentage for the product (0-100)';