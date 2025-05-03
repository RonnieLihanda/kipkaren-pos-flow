
-- Create a function to update product quantity after sale
CREATE OR REPLACE FUNCTION update_product_quantity(p_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET quantity = quantity - qty,
      updated_at = now()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
