-- Full Database Seed for Club Valencia
-- Includes Schema and 50 Dummy Players

CREATE DATABASE IF NOT EXISTS club_valencia;
USE club_valencia;

-- Disable FK checks to avoid issues during drop/create
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS asistencia_entrenamiento;
DROP TABLE IF EXISTS entrenamientos;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS uniformes;
DROP TABLE IF EXISTS documentos;
DROP TABLE IF EXISTS campeonato_categorias;
DROP TABLE IF EXISTS campeonatos;
DROP TABLE IF EXISTS categoria_personal;
DROP TABLE IF EXISTS categoria_jugador;
DROP TABLE IF EXISTS equipos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS jugadores;
DROP TABLE IF EXISTS personal;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Authentication & Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Personnel (Staff)
CREATE TABLE IF NOT EXISTS personal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL, -- Entrenador, Delegado, Fisio, Psicologo, Administrativo
    telefono VARCHAR(20),
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Players
CREATE TABLE IF NOT EXISTS jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Identity
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50),
    primer_apellido VARCHAR(50) NOT NULL,
    segundo_apellido VARCHAR(50),
    nombre VARCHAR(150) GENERATED ALWAYS AS (CONCAT(primer_nombre, ' ', COALESCE(segundo_nombre, ''), ' ', primer_apellido, ' ', COALESCE(segundo_apellido, ''))) VIRTUAL, -- Computed full name for compatibility
    fecha_nacimiento DATE NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    telefono_contacto VARCHAR(20),
    direccion TEXT,
    
    -- Representative / Legal
    representante_nombre VARCHAR(100),
    representante_cedula VARCHAR(20),
    representante_telefono VARCHAR(20),
    
    -- Medical
    tipo_sangre VARCHAR(5),
    alergias TEXT,
    antecedentes_patologicos TEXT,
    
    -- Sports & Academic History
    tiempo_entrenamiento VARCHAR(50),
    categoria_objetivo VARCHAR(50),
    antecedentes_deportivos TEXT,
    antecedentes_academicos TEXT,
    habilidades JSON, -- Stores 1-10 ratings
    
    activo TINYINT(1) DEFAULT 1, -- Soft Delete
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Categories
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- e.g., "Sub 15", "Categoria 2009"
    tipo ENUM('anual', 'bianual') NOT NULL,
    anio_inicio INT NOT NULL, -- e.g., 2012
    anio_fin INT NOT NULL, -- e.g., 2013 (Same as start for annual)
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.5 Teams (Subdivisions of Categories)
CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT,
    nombre VARCHAR(50) NOT NULL, -- "Equipo A", "Equipo B", "Azul", "Rojo"
    entrenador_id INT, -- Optional: Specific coach for this team
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (entrenador_id) REFERENCES personal(id) ON DELETE SET NULL
);

-- Pivot: Category <-> Player (Modified to include Team)
CREATE TABLE IF NOT EXISTS categoria_jugador (
    categoria_id INT,
    jugador_id INT,
    equipo_id INT NULL, -- Nullable, player might not be assigned to a specific team yet
    PRIMARY KEY (categoria_id, jugador_id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL
);

-- Pivot: Category <-> Personnel (Technical Staff assignment)
CREATE TABLE IF NOT EXISTS categoria_personal (
    categoria_id INT,
    personal_id INT,
    rol VARCHAR(50) DEFAULT 'Entrenador',
    PRIMARY KEY (categoria_id, personal_id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE CASCADE
);

-- 5. Championships
CREATE TABLE IF NOT EXISTS campeonatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pivot: Championship <-> Categories (Which categories participate)
CREATE TABLE IF NOT EXISTS campeonato_categorias (
    campeonato_id INT,
    categoria_id INT,
    PRIMARY KEY (campeonato_id, categoria_id),
    FOREIGN KEY (campeonato_id) REFERENCES campeonatos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- 6. Documentation
CREATE TABLE IF NOT EXISTS documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT,
    tipo VARCHAR(50) NOT NULL, -- 'partida_nacimiento', 'cedula', 'foto', 'ficha_medica'
    ruta_archivo VARCHAR(255) NOT NULL,
    formato VARCHAR(10) NOT NULL, -- 'jpg', 'png', 'pdf'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
);

-- 7. Uniforms
CREATE TABLE IF NOT EXISTS uniformes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT UNIQUE,
    talla_camisa VARCHAR(10),
    talla_short VARCHAR(10),
    numero_dorsal INT,
    estado ENUM('sin_uniforme', 'en_espera', 'con_uniforme') DEFAULT 'sin_uniforme',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
);

-- 8. Payments
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT,
    personal_id INT, -- Added for staff payments
    monto DECIMAL(10, 2) NOT NULL,
    concepto VARCHAR(100) NOT NULL, -- 'Mensualidad Enero', 'Inscripcion', 'Uniforme'
    estado ENUM('pendiente', 'pagado') DEFAULT 'pendiente',
    fecha_pago DATE,
    metodo_pago VARCHAR(50), -- 'transferencia', 'efectivo', 'pago_movil'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE,
    FOREIGN KEY (personal_id) REFERENCES personal(id) ON DELETE CASCADE
);

-- 9. Training Sessions
CREATE TABLE IF NOT EXISTS entrenamientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT, -- Which category is training
    equipo_id INT NULL, -- Specific team training? Optional, if null = whole category
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar VARCHAR(100) DEFAULT 'Cancha Principal',
    tema VARCHAR(150), -- e.g., "Resistencia Física", "Táctica Defensiva"
    observaciones TEXT,
    estado ENUM('programado', 'realizado', 'cancelado') DEFAULT 'programado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL
);

-- Pivot: Attendance (Session <-> Player)
CREATE TABLE IF NOT EXISTS asistencia_entrenamiento (
    entrenamiento_id INT,
    jugador_id INT,
    asistio TINYINT(1) DEFAULT 0,
    observacion VARCHAR(255), -- e.g., "Llegó tarde", "Lesionado"
    PRIMARY KEY (entrenamiento_id, jugador_id),
    FOREIGN KEY (entrenamiento_id) REFERENCES entrenamientos(id) ON DELETE CASCADE,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
);

-- Default Admin User
INSERT INTO users (username, password, role) VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 50 Players Seed (Placeholder, to be appended by Python output manual copy if I wasn't automating it, but I will append it in next tool calls or just overwrite this file with composed string)
