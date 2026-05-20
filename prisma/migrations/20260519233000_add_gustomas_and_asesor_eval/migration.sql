-- Cliente-only fields: what they liked most + advisor evaluation
ALTER TABLE "ParticipanteRifa"
  ADD COLUMN "gustoMas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "satisfaccionAsesor" INTEGER,
  ADD COLUMN "npsAsesor" INTEGER;
