CREATE TABLE "integraciones" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'SMTP',
    "servidor" TEXT NOT NULL DEFAULT '',
    "usuario" TEXT NOT NULL DEFAULT '',
    "contrasena" TEXT NOT NULL DEFAULT '',
    "puerto" TEXT NOT NULL DEFAULT '',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integraciones_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "integraciones_empresaId_descripcion_key" ON "integraciones"("empresaId", "descripcion");

ALTER TABLE "integraciones"
ADD CONSTRAINT "integraciones_empresaId_fkey"
FOREIGN KEY ("empresaId") REFERENCES "empresas"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
