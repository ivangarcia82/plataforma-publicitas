-- Add ejecutivoId nullable so we can backfill existing rows
ALTER TABLE "Empresa" ADD COLUMN "ejecutivoId" TEXT;

-- Backfill existing empresas with the first ejecutivo by creation order
UPDATE "Empresa"
SET "ejecutivoId" = (SELECT id FROM "Ejecutivo" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "ejecutivoId" IS NULL;

-- Now enforce NOT NULL
ALTER TABLE "Empresa" ALTER COLUMN "ejecutivoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Empresa" ADD CONSTRAINT "Empresa_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES "Ejecutivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
