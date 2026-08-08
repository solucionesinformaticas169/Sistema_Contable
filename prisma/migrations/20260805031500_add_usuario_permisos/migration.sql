CREATE TABLE "usuarios_permisos" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "paginaKey" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "pagina" TEXT NOT NULL,
    "visualizar" BOOLEAN NOT NULL DEFAULT false,
    "agregar" BOOLEAN NOT NULL DEFAULT false,
    "modificar" BOOLEAN NOT NULL DEFAULT false,
    "eliminar" BOOLEAN NOT NULL DEFAULT false,
    "verCosto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_permisos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_permisos_usuarioId_paginaKey_key"
ON "usuarios_permisos"("usuarioId", "paginaKey");

ALTER TABLE "usuarios_permisos"
ADD CONSTRAINT "usuarios_permisos_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
