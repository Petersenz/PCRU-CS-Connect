-- Drop existing foreign key constraint
ALTER TABLE question_categories 
DROP CONSTRAINT IF EXISTS question_categories_category_id_fkey;

-- Add new foreign key with ON DELETE RESTRICT
ALTER TABLE question_categories
ADD CONSTRAINT question_categories_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES categories(category_id) 
ON DELETE RESTRICT;

-- This will prevent deletion of categories that are in use
-- Database will throw error code 23503 (foreign_key_violation)
