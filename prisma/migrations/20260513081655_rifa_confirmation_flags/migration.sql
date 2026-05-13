-- AlterTable
ALTER TABLE "ParticipanteRifa" ADD COLUMN     "entregado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rechazado" BOOLEAN NOT NULL DEFAULT false;
