<?php
// full_migration.php

require_once __DIR__ . '/app/Core/Database.php';

use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to database.\n";

    // 1. Create 'equipos' table
    $db->exec("
        CREATE TABLE IF NOT EXISTS equipos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            categoria_id INT,
            nombre VARCHAR(50) NOT NULL,
            entrenador_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
            FOREIGN KEY (entrenador_id) REFERENCES personal(id) ON DELETE SET NULL
        )
    ");
    echo "Checked/Created 'equipos' table.\n";

    // 2. Add 'equipo_id' to 'categoria_jugador' if missing
    // Check if column exists
    $stmt = $db->query("SHOW COLUMNS FROM categoria_jugador LIKE 'equipo_id'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE categoria_jugador ADD COLUMN equipo_id INT NULL");
        $db->exec("ALTER TABLE categoria_jugador ADD FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL");
        echo "Added 'equipo_id' to 'categoria_jugador'.\n";
    } else {
        echo "'equipo_id' already exists in 'categoria_jugador'.\n";
    }

    // 3. Create 'entrenamientos' table (if strictly missing)
    // If it exists but is old version, we need to alter it.
    $stmt = $db->query("SHOW TABLES LIKE 'entrenamientos'");
    if ($stmt->rowCount() == 0) {
        $db->exec("
            CREATE TABLE IF NOT EXISTS entrenamientos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                categoria_id INT,
                equipo_id INT NULL,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                lugar VARCHAR(100) DEFAULT 'Cancha Principal',
                tema VARCHAR(150),
                observaciones TEXT,
                estado ENUM('programado', 'realizado', 'cancelado') DEFAULT 'programado',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
                FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL
            )
        ");
        echo "Created 'entrenamientos' table.\n";
    } else {
        // Table exists, check for 'equipo_id'
        $stmt = $db->query("SHOW COLUMNS FROM entrenamientos LIKE 'equipo_id'");
        if ($stmt->rowCount() == 0) {
            $db->exec("ALTER TABLE entrenamientos ADD COLUMN equipo_id INT NULL");
            $db->exec("ALTER TABLE entrenamientos ADD FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL");
            echo "Added 'equipo_id' to 'entrenamientos'.\n";
        }
        // Check for 'estado'
        $stmt = $db->query("SHOW COLUMNS FROM entrenamientos LIKE 'estado'");
        if ($stmt->rowCount() == 0) {
            $db->exec("ALTER TABLE entrenamientos ADD COLUMN estado ENUM('programado', 'realizado', 'cancelado') DEFAULT 'programado'");
            echo "Added 'estado' to 'entrenamientos'.\n";
        }
    }

    // 4. Create 'asistencia_entrenamiento' table
    $db->exec("
        CREATE TABLE IF NOT EXISTS asistencia_entrenamiento (
            entrenamiento_id INT,
            jugador_id INT,
            asistio TINYINT(1) DEFAULT 0,
            observacion VARCHAR(255),
            PRIMARY KEY (entrenamiento_id, jugador_id),
            FOREIGN KEY (entrenamiento_id) REFERENCES entrenamientos(id) ON DELETE CASCADE,
            FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
        )
    ");
    echo "Checked/Created 'asistencia_entrenamiento' table.\n";

    // 5. Create 'uniformes' table (just in case)
    $db->exec("
        CREATE TABLE IF NOT EXISTS uniformes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            jugador_id INT UNIQUE,
            talla_camisa VARCHAR(10),
            talla_short VARCHAR(10),
            numero_dorsal INT,
            estado ENUM('sin_uniforme', 'en_espera', 'con_uniforme') DEFAULT 'sin_uniforme',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
        )
    ");
    echo "Checked/Created 'uniformes' table.\n";

    echo "Migration completed successfully.\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
