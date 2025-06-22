-- Update the migration name in the database
UPDATE "_prisma_migrations" 
SET migration_name = '20250620213000_add_product_offer_fields' 
WHERE migration_name = '20250620_add_product_offer_fields';