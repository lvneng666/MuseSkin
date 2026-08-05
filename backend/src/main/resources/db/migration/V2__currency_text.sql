-- CHAR(3) reports as Types#CHAR (bpchar), which Hibernate's validate rejects for
-- a String field. TEXT reports as Types#VARCHAR (compatible) and is API-invisible.
ALTER TABLE orders ALTER COLUMN currency TYPE TEXT;
