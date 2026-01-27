<?php

namespace App\Models;

use App\Core\Model;
use DateTime;

class Jugador extends Model
{
    protected $table = 'jugadores';

    public function findAllActiveWithAge()
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE activo = 1 ORDER BY apellido ASC");
        $stmt->execute();
        $players = $stmt->fetchAll();

        // Calculate age on the fly
        foreach ($players as &$player) {
            $player['edad'] = $this->calculateAge($player['fecha_nacimiento']);
        }

        return $players;
    }

    public function findWithAge($id)
    {
        $player = $this->find($id);
        if ($player) {
            $player['edad'] = $this->calculateAge($player['fecha_nacimiento']);
        }
        return $player;
    }

    private function calculateAge($birthDate)
    {
        $dob = new DateTime($birthDate);
        $now = new DateTime();
        $diff = $now->diff($dob);
        return $diff->y;
    }

    public function softDelete($id)
    {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET activo = 0 WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }

    public function restore($id)
    {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET activo = 1 WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
