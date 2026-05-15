-- Convert StaffMember.diaAsignado (String) to diasAsignados (String[])
ALTER TABLE "StaffMember" ADD COLUMN "diasAsignados" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill from old column
UPDATE "StaffMember"
SET "diasAsignados" = ARRAY["diaAsignado"]
WHERE "diaAsignado" IS NOT NULL AND "diaAsignado" <> '';

-- Drop old column
ALTER TABLE "StaffMember" DROP COLUMN "diaAsignado";

-- Remove default now that data is migrated
ALTER TABLE "StaffMember" ALTER COLUMN "diasAsignados" DROP DEFAULT;
