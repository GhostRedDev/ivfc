<?php

namespace App\Models;

use App\Core\Model;

class Pago extends Model
{
    protected $table = 'pagos';

    public function findByJugador($jugadorId)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE jugador_id = :id ORDER BY created_at DESC");
        $stmt->execute(['id' => $jugadorId]);
        return $stmt->fetchAll();
    }

    public function findByPersonal($personalId)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE personal_id = :id ORDER BY created_at DESC");
        $stmt->execute(['id' => $personalId]);
        return $stmt->fetchAll();
    }
}
