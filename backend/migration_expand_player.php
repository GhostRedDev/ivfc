<?php

require_once __DIR__ . '/app/Core/Database.php';
use App\Core\Database;

try {
    $db = Database::getInstance()->getConnection();
    echo "Connected to MySQL.\n";

    // multiple alter statements
    $alters = [
        "ALTER TABLE jugadores ADD COLUMN primer_nombre VARCHAR(50) AFTER id",
        "ALTER TABLE jugadores ADD COLUMN segundo_nombre VARCHAR(50) AFTER primer_nombre",
        "ALTER TABLE jugadores ADD COLUMN primer_apellido VARCHAR(50) AFTER segundo_nombre",
        "ALTER TABLE jugadores ADD COLUMN segundo_apellido VARCHAR(50) AFTER primer_apellido",
        // Note: We might want to keep 'nombre' and 'apellido' for now to avoid breaking or migrat data 
        // But the user asked for these specifically. I'll add them.

        "ALTER TABLE jugadores ADD COLUMN tiempo_entrenamiento VARCHAR(50)",
        "ALTER TABLE jugadores ADD COLUMN categoria_objetivo VARCHAR(50)",
        "ALTER TABLE jugadores ADD COLUMN antecedentes_patologicos TEXT",
        "ALTER TABLE jugadores ADD COLUMN antecedentes_deportivos TEXT",
        "ALTER TABLE jugadores ADD COLUMN antecedentes_academicos TEXT",
        "ALTER TABLE jugadores ADD COLUMN habilidades JSON" // MySQL 5.7+ supports JSON
    ];

    foreach ($alters as $sql) {
        try {
            $db->exec($sql);
            echo "Executed: $sql\n";
        } catch (PDOException $e) {
            // Ignore if column exists
            if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
                echo "Column already exists, skipping.\n";
            } else {
                echo "Error: " . $e->getMessage() . "\n";
            }
        }
    }

    echo "Migration completed.\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage();
}
