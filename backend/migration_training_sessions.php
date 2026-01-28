<?php
$config = require 'config/database.php';

try {
    $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);

    $sql = "
    CREATE TABLE IF NOT EXISTS entrenamientos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        categoria_id INT,
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        lugar VARCHAR(100) DEFAULT 'Cancha Principal',
        tema VARCHAR(150),
        observaciones TEXT,
        estado ENUM('programado', 'realizado', 'cancelado') DEFAULT 'programado',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS asistencia_entrenamiento (
        entrenamiento_id INT,
        jugador_id INT,
        asistio TINYINT(1) DEFAULT 0,
        observacion VARCHAR(255),
        PRIMARY KEY (entrenamiento_id, jugador_id),
        FOREIGN KEY (entrenamiento_id) REFERENCES entrenamientos(id) ON DELETE CASCADE,
        FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE
    );
    ";

    $pdo->exec($sql);
    echo "Tablas 'entrenamientos' y 'asistencia_entrenamiento' creadas exitosamente.";
} catch (PDOException $e) {
    echo "Error en migración: " . $e->getMessage();
}
?>