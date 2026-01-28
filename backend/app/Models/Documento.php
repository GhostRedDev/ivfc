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
}
