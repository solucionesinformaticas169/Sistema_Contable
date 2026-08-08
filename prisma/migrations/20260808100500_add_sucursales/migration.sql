CREATE TABLE "sucursales" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "responsable" TEXT NOT NULL DEFAULT '',
    "ciudad" TEXT NOT NULL DEFAULT '',
    "direccion" TEXT NOT NULL DEFAULT '',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sucursales_empresaId_nombre_key" ON "sucursales"("empresaId", "nombre");

ALTER TABLE "sucursales"
ADD CONSTRAINT "sucursales_empresaId_fkey"
FOREIGN KEY ("empresaId") REFERENCES "empresas"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
