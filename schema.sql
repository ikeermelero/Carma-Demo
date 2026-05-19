-- =========================================================
-- BASE DE DATOS - PLATAFORMA GESTIÓN DE TALLERES
-- PostgreSQL
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- ROLES
-- =========================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    role_id UUID REFERENCES roles(id),

    nombre VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120),

    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,

    telefono VARCHAR(30),

    activo BOOLEAN DEFAULT TRUE,

    ultimo_login TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- TALLERES
-- =========================================================

CREATE TABLE talleres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nombre VARCHAR(120) NOT NULL,

    direccion TEXT,
    telefono VARCHAR(30),
    email VARCHAR(255),

    horario TEXT,

    activo BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- USER_TALLERES
-- Relación usuarios <-> talleres
-- =========================================================

CREATE TABLE user_talleres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    taller_id UUID REFERENCES talleres(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, taller_id)
);

-- =========================================================
-- CLIENTES
-- =========================================================

CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nombre VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120),

    telefono VARCHAR(30),
    email VARCHAR(255),

    direccion TEXT,
    notas TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- COCHES
-- =========================================================

CREATE TABLE coches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cliente_id UUID REFERENCES clientes(id),

    matricula VARCHAR(20) UNIQUE NOT NULL,

    marca VARCHAR(80),
    modelo VARCHAR(80),

    anio INTEGER,

    vin VARCHAR(100),

    kilometros INTEGER,

    color VARCHAR(50),

    observaciones TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- ESTADOS REPARACIÓN
-- =========================================================

CREATE TABLE estados_reparacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nombre VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),

    orden INTEGER
);

-- =========================================================
-- REPARACIONES
-- =========================================================

CREATE TABLE reparaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    taller_id UUID REFERENCES talleres(id),
    coche_id UUID REFERENCES coches(id),

    estado_id UUID REFERENCES estados_reparacion(id),

    titulo VARCHAR(255),

    descripcion TEXT,

    prioridad VARCHAR(30),

    fecha_entrada TIMESTAMP DEFAULT NOW(),

    fecha_estimada TIMESTAMP,

    fecha_finalizacion TIMESTAMP,

    coste_estimado DECIMAL(10,2),
    coste_final DECIMAL(10,2),

    tiempo_estimado INTEGER,
    tiempo_real INTEGER,

    urgente BOOLEAN DEFAULT FALSE,

    created_by UUID REFERENCES users(id),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- ESTADOS TAREA
-- =========================================================

CREATE TABLE estados_tarea (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    nombre VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),

    orden INTEGER
);

-- =========================================================
-- TAREAS
-- =========================================================

CREATE TABLE tareas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reparacion_id UUID REFERENCES reparaciones(id) ON DELETE CASCADE,

    user_id UUID REFERENCES users(id),

    estado_id UUID REFERENCES estados_tarea(id),

    titulo VARCHAR(255) NOT NULL,

    descripcion TEXT,

    prioridad VARCHAR(30),

    tiempo_estimado INTEGER,
    tiempo_real INTEGER,

    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,

    orden INTEGER,

    bloqueada BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- LOGS DE TAREAS / REPARACIONES
-- =========================================================

CREATE TABLE reparacion_tareas_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,

    user_id UUID REFERENCES users(id),

    accion VARCHAR(100),

    valor_anterior TEXT,
    valor_nuevo TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- CITAS
-- =========================================================

CREATE TABLE citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    taller_id UUID REFERENCES talleres(id),

    cliente_id UUID REFERENCES clientes(id),
    coche_id UUID REFERENCES coches(id),

    fecha TIMESTAMP NOT NULL,

    motivo TEXT,

    estado VARCHAR(50),

    observaciones TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- COMENTARIOS REPARACIÓN
-- =========================================================

CREATE TABLE comentarios_reparacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reparacion_id UUID REFERENCES reparaciones(id) ON DELETE CASCADE,

    user_id UUID REFERENCES users(id),

    comentario TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- ARCHIVOS REPARACIÓN
-- =========================================================

CREATE TABLE archivos_reparacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    reparacion_id UUID REFERENCES reparaciones(id) ON DELETE CASCADE,

    nombre VARCHAR(255),

    url TEXT,

    tipo VARCHAR(50),

    uploaded_by UUID REFERENCES users(id),

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- SERVICIOS TALLER
-- =========================================================

CREATE TABLE servicios_taller (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    taller_id UUID REFERENCES talleres(id) ON DELETE CASCADE,

    nombre VARCHAR(120),

    descripcion TEXT
);

-- =========================================================
-- AUDITORÍA DE CAMBIOS
-- =========================================================

CREATE TABLE auditoria_cambios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    tabla VARCHAR(100),

    registro_id UUID,

    accion VARCHAR(50),

    user_id UUID REFERENCES users(id),

    datos_anteriores JSONB,
    datos_nuevos JSONB,

    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- ÍNDICES
-- =========================================================

CREATE INDEX idx_reparaciones_estado
ON reparaciones(estado_id);

CREATE INDEX idx_reparaciones_taller
ON reparaciones(taller_id);

CREATE INDEX idx_reparaciones_coche
ON reparaciones(coche_id);

CREATE INDEX idx_tareas_user
ON tareas(user_id);

CREATE INDEX idx_tareas_estado
ON tareas(estado_id);

CREATE INDEX idx_tareas_reparacion
ON tareas(reparacion_id);

CREATE INDEX idx_coches_matricula
ON coches(matricula);

CREATE INDEX idx_clientes_telefono
ON clientes(telefono);

CREATE INDEX idx_clientes_email
ON clientes(email);

CREATE INDEX idx_citas_fecha
ON citas(fecha);

-- =========================================================
-- DATOS INICIALES
-- =========================================================

-- ROLES

INSERT INTO roles (nombre, descripcion)
VALUES
('admin', 'Administrador total del sistema'),
('encargado', 'Encargado de taller'),
('mecanico', 'Mecánico del taller');

-- ESTADOS REPARACIÓN

INSERT INTO estados_reparacion (nombre, color, orden)
VALUES
('pendiente', '#facc15', 1),
('en_curso', '#3b82f6', 2),
('en_espera', '#f97316', 3),
('finalizada', '#22c55e', 4),
('entregada', '#6b7280', 5);

-- ESTADOS TAREA

INSERT INTO estados_tarea (nombre, color, orden)
VALUES
('pendiente', '#facc15', 1),
('en_curso', '#3b82f6', 2),
('bloqueada', '#ef4444', 3),
('finalizada', '#22c55e', 4);

-- =========================================================
-- FIN
-- =========================================================