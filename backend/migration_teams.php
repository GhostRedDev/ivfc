<?php
$config = require 'config/database.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);

    // Create 'equipos' table
    $sql1 = "
    CREATE TABLE IF NOT EXISTS equipos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        categoria_id INT,
        nombre VARCHAR(50) NOT NULL,
        entrenador_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
        FOREIGN KEY (entrenador_id) REFERENCES personal(id) ON DELETE SET NULL
    );
    ";
    $pdo->exec($sql1);
    echo "Tabla 'equipos' creada.\n";

    // Add 'equipo_id' column to 'categoria_jugador' if not exists
    // This is trickier in raw SQL check, simpler to try/catch add column
    try {
        $pdo->exec("ALTER TABLE categoria_jugador ADD COLUMN equipo_id INT NULL DEFAULT NULL");
        $pdo->exec("ALTER TABLE categoria_jugador ADD CONSTRAINT fk_cj_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL");
        echo "Columna 'equipo_id' agregada a 'categoria_jugador'.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "Columna 'equipo_id' ya existe.\n";
        } else {
            throw $e;
        }
    }

    // Update 'entrenamientos' to allow specific team training
    try {
        $pdo->exec("ALTER TABLE entrenamientos ADD COLUMN equipo_id INT NULL DEFAULT NULL");
        $pdo->exec("ALTER TABLE entrenamientos ADD CONSTRAINT fk_e_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL");
        echo "Columna 'equipo_id' agregada a 'entrenamientos'.\n";
    } catch (PDOException $e) {
        // Ignore duplicate column
        echo "Columna 'equipo_id' ya existe en 'entrenamientos'.\n";
    }

} catch (PDOException $e) {
    echo "Error en migración: " . $e->getMessage();
}
?>