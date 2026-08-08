CREATE TABLE "geo_provincias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "geo_provincias_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "geo_ciudades" (
    "id" SERIAL NOT NULL,
    "provinciaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "geo_ciudades_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "geo_parroquias" (
    "id" SERIAL NOT NULL,
    "ciudadId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "geo_parroquias_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "geo_provincias_nombre_key" ON "geo_provincias"("nombre");
CREATE UNIQUE INDEX "geo_ciudades_provinciaId_nombre_key" ON "geo_ciudades"("provinciaId", "nombre");
CREATE UNIQUE INDEX "geo_parroquias_ciudadId_nombre_key" ON "geo_parroquias"("ciudadId", "nombre");

ALTER TABLE "geo_ciudades"
ADD CONSTRAINT "geo_ciudades_provinciaId_fkey"
FOREIGN KEY ("provinciaId") REFERENCES "geo_provincias"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "geo_parroquias"
ADD CONSTRAINT "geo_parroquias_ciudadId_fkey"
FOREIGN KEY ("ciudadId") REFERENCES "geo_ciudades"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

INSERT INTO "geo_provincias" ("nombre")
VALUES
  ('Pichincha'),
  ('Guayas'),
  ('Azuay'),
  ('Manabi');

WITH ciudades AS (
  INSERT INTO "geo_ciudades" ("provinciaId", "nombre")
  VALUES
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Pichincha'), 'Quito'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Pichincha'), 'Cayambe'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Pichincha'), 'Ruminahui'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Guayas'), 'Guayaquil'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Guayas'), 'Duran'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Guayas'), 'Samborondon'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Azuay'), 'Cuenca'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Azuay'), 'Gualaceo'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Azuay'), 'Paute'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Manabi'), 'Manta'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Manabi'), 'Portoviejo'),
    ((SELECT id FROM "geo_provincias" WHERE "nombre" = 'Manabi'), 'Chone')
  RETURNING "id", "nombre"
)
INSERT INTO "geo_parroquias" ("ciudadId", "nombre")
VALUES
  ((SELECT id FROM ciudades WHERE "nombre" = 'Quito'), 'Quito Distrito Metropolitano'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Quito'), 'La Delicia'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Quito'), 'Eloy Alfaro'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Cayambe'), 'Cayambe'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Cayambe'), 'Ascazubi'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Ruminahui'), 'Sangolqui'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Ruminahui'), 'San Rafael'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Guayaquil'), 'Guayaquil Norte'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Guayaquil'), 'Guayaquil Centro'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Duran'), 'Eloy Alfaro'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Duran'), 'Divino Nino'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Samborondon'), 'La Puntilla'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Samborondon'), 'Tarifa'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Cuenca'), 'Cuenca Urbana'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Cuenca'), 'El Valle'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Gualaceo'), 'Gualaceo'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Gualaceo'), 'Luis Cordero'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Paute'), 'Paute'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Paute'), 'Bulan'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Manta'), 'Manta Urbana'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Manta'), 'Tarqui'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Portoviejo'), 'Portoviejo Urbana'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Portoviejo'), 'Calderon'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Chone'), 'Chone'),
  ((SELECT id FROM ciudades WHERE "nombre" = 'Chone'), 'Santa Rita');
