-- AlterTable
ALTER TABLE "event_categories" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "event_formats" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- Set initial order values for existing formats based on creation order
UPDATE "event_formats" AS ef
SET "order" = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "eventId" ORDER BY id) - 1 AS row_num
  FROM "event_formats"
) AS subquery
WHERE ef.id = subquery.id;

-- Set initial order values for existing categories based on creation order
UPDATE "event_categories" AS ec
SET "order" = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "eventId" ORDER BY id) - 1 AS row_num
  FROM "event_categories"
) AS subquery
WHERE ec.id = subquery.id;
