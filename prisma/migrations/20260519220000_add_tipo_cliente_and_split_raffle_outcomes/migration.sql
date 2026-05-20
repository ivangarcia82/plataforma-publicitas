-- Add new columns
ALTER TABLE "ParticipanteRifa"
  ADD COLUMN "tipoCliente" TEXT NOT NULL DEFAULT 'cliente',
  ADD COLUMN "servicioInteres" TEXT,
  ADD COLUMN "npsScore" INTEGER,
  ADD COLUMN "ganoEnPremium" TIMESTAMP(3),
  ADD COLUMN "entregadoPremium" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "rechazadoPremium" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "ganoEnSencilla" TIMESTAMP(3),
  ADD COLUMN "entregadoSencilla" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "rechazadoSencilla" BOOLEAN NOT NULL DEFAULT false;

-- Backfill existing outcome state into Sencilla columns (single legacy raffle becomes "sencilla")
UPDATE "ParticipanteRifa"
SET "ganoEnSencilla" = "ganoEn",
    "entregadoSencilla" = "entregado",
    "rechazadoSencilla" = "rechazado";

-- Drop legacy columns
ALTER TABLE "ParticipanteRifa"
  DROP COLUMN "ganoEn",
  DROP COLUMN "entregado",
  DROP COLUMN "rechazado";

-- Make ejecutivoId nullable (prospectos no necesitan ejecutivo)
ALTER TABLE "ParticipanteRifa" DROP CONSTRAINT IF EXISTS "ParticipanteRifa_ejecutivoId_fkey";
ALTER TABLE "ParticipanteRifa" ALTER COLUMN "ejecutivoId" DROP NOT NULL;
ALTER TABLE "ParticipanteRifa"
  ADD CONSTRAINT "ParticipanteRifa_ejecutivoId_fkey"
  FOREIGN KEY ("ejecutivoId") REFERENCES "Ejecutivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
