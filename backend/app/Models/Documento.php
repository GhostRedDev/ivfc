<?php

namespace App\Models;

use App\Core\Model;

class Documento extends Model
{
    protected $table = 'documentos';

    public function findByJugador($jugadorId)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE jugador_id = :id");
        $stmt->execute(['id' => $jugadorId]);
        return $stmt->fetchAll();
    }

    public function findAllWithJugador()
    {
        $sql = "SELECT d.*, j.nombre, j.apellido, j.cedula 
                FROM {$this->table} d 
                JOIN jugadores j ON d.jugador_id = j.id 
                ORDER BY d.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
