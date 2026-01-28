<?php

namespace App\Models;

use App\Core\Model;

class Uniforme extends Model
{
    protected $table = 'uniformes';

    public function findByJugador($jugadorId)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE jugador_id = :id");
        $stmt->execute(['id' => $jugadorId]);
        return $stmt->fetch();
    }
}
