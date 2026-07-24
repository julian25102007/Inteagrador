-- =====================================================
-- Version PostgreSQL del esquema evansong.
-- Los ENUM de MySQL se representan como VARCHAR + CHECK
-- para simplificar el JDBC genérico del backend.
-- Crea primero la base: CREATE DATABASE evansong;  y conéctate a ella.
-- =====================================================

-- =====================================
-- TABLA CORREO_COORDINADOR
-- =====================================
CREATE TABLE correo_coordinador (
    id_correo SERIAL PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    utilizado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- TABLA USUARIO
-- =====================================
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(15),
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('Coordinador','Corista')),
    foto_perfil VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT
);

-- =====================================
-- TABLA TIEMPO LITURGICO
-- =====================================
CREATE TABLE tiempo_liturgico (
    id_tiempo SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- =====================================
-- TABLA MOMENTO MISA
-- =====================================
CREATE TABLE momento_misa (
    id_momento SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE
);

-- =====================================
-- TABLA CANTO
-- =====================================
CREATE TABLE canto (
    id_canto SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    autor VARCHAR(100),
    id_tiempo INT,
    id_momento INT,
    dificultad VARCHAR(10) NOT NULL CHECK (dificultad IN ('Baja','Media','Alta')),
    letra TEXT,
    url_youtube VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_tiempo) REFERENCES tiempo_liturgico(id_tiempo),
    FOREIGN KEY (id_momento) REFERENCES momento_misa(id_momento)
);

-- =====================================
-- TABLA LISTA
-- =====================================
CREATE TABLE lista (
    id_lista SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- =====================================
-- TABLA LISTA_CANTO
-- =====================================
CREATE TABLE lista_canto (
    id_lista INT NOT NULL,
    id_canto INT NOT NULL,

    PRIMARY KEY(id_lista,id_canto),

    FOREIGN KEY(id_lista) REFERENCES lista(id_lista)
        ON DELETE CASCADE,

    FOREIGN KEY(id_canto) REFERENCES canto(id_canto)
        ON DELETE CASCADE
);

-- =====================================
-- TABLA ESQUEMA
-- =====================================
CREATE TABLE esquema (
    id_esquema SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,

    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);

-- =====================================
-- TABLA DETALLE_ESQUEMA
-- =====================================
CREATE TABLE detalle_esquema (
    id_detalle SERIAL PRIMARY KEY,
    id_esquema INT NOT NULL,
    id_momento INT NOT NULL,
    id_canto INT NOT NULL,
    orden INT NOT NULL,

    FOREIGN KEY(id_esquema) REFERENCES esquema(id_esquema)
        ON DELETE CASCADE,

    FOREIGN KEY(id_momento) REFERENCES momento_misa(id_momento),

    FOREIGN KEY(id_canto) REFERENCES canto(id_canto)
);

-- =====================================
-- TABLA EVENTO
-- =====================================
CREATE TABLE evento (
    id_evento SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    lugar VARCHAR(100),
    descripcion TEXT,
    activar_asistencia BOOLEAN DEFAULT FALSE,
    id_usuario INT NOT NULL,

    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);

-- =====================================
-- TABLA ASISTENCIA
-- =====================================
CREATE TABLE asistencia (
    id_asistencia SERIAL PRIMARY KEY,
    id_evento INT NOT NULL,
    id_usuario INT NOT NULL,
    asistira BOOLEAN NOT NULL,

    FOREIGN KEY(id_evento) REFERENCES evento(id_evento)
        ON DELETE CASCADE,

    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
);

-- =====================================
-- TABLA PUBLICACION
-- =====================================
CREATE TABLE publicacion (
    id_publicacion SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('Aviso','Evento','General','Urgente')),
    descripcion TEXT,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL,

    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);

-- PostgreSQL no tiene "ON UPDATE CURRENT_TIMESTAMP" como MySQL,
-- así que se simula con un trigger:
CREATE OR REPLACE FUNCTION set_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_publicacion_fecha_actualizacion
BEFORE UPDATE ON publicacion
FOR EACH ROW
EXECUTE FUNCTION set_fecha_actualizacion();

-- =====================================
-- TABLA INVENTARIO
-- =====================================
CREATE TABLE inventario (
    id_articulo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('Sonido','Iluminacion','Instrumento','Accesorios','Cables')),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('En uso','En buen estado','En mal estado','En reparacion')),
    modelo VARCHAR(100),
    id_usuario INT NOT NULL,

    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);

-- =====================================
-- TABLA FINANZA
-- =====================================
CREATE TABLE finanza (
    id_finanza SERIAL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('Ingreso','Egreso')),
    monto DECIMAL(10,2) NOT NULL,
    fecha DATE NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    id_usuario INT NOT NULL,

    FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);
