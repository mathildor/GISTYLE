DROP DATABASE IF EXISTS postgisLayers;
CREATE DATABASE postgisLayers;

\c postgisLayers;

CREATE TABLE  layers(
  layerName VARCHAR,
  layer JSON
);

INSERT INTO layers (name, breed, age, sex)
  VALUES ('Tyler', 'Retrieved', 3, 'M');