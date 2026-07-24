-- Catálogos base que usa el frontend para clasificar cantos y esquemas.
-- Corre esto UNA sola vez contra tu base de datos (evansong).
--
-- IMPORTANTE: si ya habías corrido una versión anterior de este seed
-- (con nombres distintos como "Tiempo Ordinario" o "Acto penitencial"),
-- primero borra esas filas viejas para no tener duplicados ni dejar
-- cantos/esquemas huérfanos apuntando a nombres que ya no existen:
--   DELETE FROM tiempo_liturgico;
--   DELETE FROM momento_misa;
-- (Ojo: si ya tienes cantos/esquemas usando esas filas viejas, primero
-- reasígnalos a las filas nuevas o bórralos, porque hay llaves foráneas.)
--
-- Ejemplo para correrlo:
--   mysql -u evansong_app -p evansong < catalogo_seed.sql

INSERT INTO tiempo_liturgico (nombre) VALUES
  ('Ordinario'), ('Adviento'), ('Navidad'), ('Cuaresma'), ('Pascua');

INSERT INTO momento_misa (nombre) VALUES
  ('Entrada'), ('Acto de Penitencia'), ('Gloria'), ('Ofertorio'),
  ('Santo'), ('Consagración'), ('Comunión'), ('Salida');
