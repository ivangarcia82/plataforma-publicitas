-- CreateTable
CREATE TABLE "ParticipanteRifa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT NOT NULL DEFAULT '',
    "cargo" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL DEFAULT '',
    "diaRifa" TEXT NOT NULL,
    "numeroTicket" INTEGER NOT NULL,
    "ejecutivoId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comentario" TEXT NOT NULL DEFAULT '',
    "reviewId" TEXT,
    "ganoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipanteRifa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParticipanteRifa_reviewId_key" ON "ParticipanteRifa"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipanteRifa_diaRifa_numeroTicket_key" ON "ParticipanteRifa"("diaRifa", "numeroTicket");

-- AddForeignKey
ALTER TABLE "ParticipanteRifa" ADD CONSTRAINT "ParticipanteRifa_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES "Ejecutivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteRifa" ADD CONSTRAINT "ParticipanteRifa_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
