<?php

namespace App\Models;

use App\Core\Model;

class Equipo extends Model
{
    protected $table = 'equipos';

    public function findAllWithCategory()
    {
        $stmt = $this->db->prepare("
            SELECT e.*, c.nombre as categoria_nombre 
            FROM {$this->table} e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            ORDER BY c.nombre, e.nombre
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function findByCategory($categoriaId)
    {
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table} 
            WHERE categoria_id = :id
            ORDER BY nombre
        ");
        $stmt->execute(['id' => $categoriaId]);
        return $stmt->fetchAll();
    }

    public function getPlayers($equipoId)
    {
        $stmt = $this->db->prepare("
            SELECT j.* 
            FROM jugadores j
            JOIN categoria_jugador cj ON j.id = cj.jugador_id
            WHERE cj.equipo_id = :id AND j.activo = 1
            ORDER BY j.apellido ASC
        ");
        $stmt->execute(['id' => $equipoId]);
        return $stmt->fetchAll();
    }
}
