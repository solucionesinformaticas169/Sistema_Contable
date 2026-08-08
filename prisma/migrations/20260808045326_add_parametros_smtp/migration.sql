/*
  Warnings:

  - Made the column `tipoNegocio` on table `empresas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "empresas" ALTER COLUMN "tipoNegocio" SET NOT NULL,
ALTER COLUMN "correo" DROP DEFAULT,
ALTER COLUMN "direccion" DROP DEFAULT,
ALTER COLUMN "provincia" DROP DEFAULT,
ALTER COLUMN "ciudad" DROP DEFAULT,
ALTER COLUMN "whatsapp" DROP DEFAULT;
