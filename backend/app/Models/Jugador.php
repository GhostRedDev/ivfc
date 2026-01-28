<?php

namespace App\Models;

use App\Core\Model;
use DateTime;

class Jugador extends Model
{
    protected $table = 'jugadores';

    public function findAllWithAge()
    {
        $sql = "
            SELECT j.*, 
                   c.nombre as categoria_nombre, 
                   c.id as categoria_id,
                   d.ruta_archivo as foto_url
            FROM {$this->table} j
            LEFT JOIN categoria_jugador cj ON j.id = cj.jugador_id
            LEFT JOIN categorias c ON cj.categoria_id = c.id
            LEFT JOIN documentos d ON j.id = d.jugador_id AND d.tipo = 'foto'
            ORDER BY j.apellido ASC
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $players = $stmt->fetchAll();

        // Calculate age on the fly
        foreach ($players as &$player) {
            $player['edad'] = $this->calculateAge($player['fecha_nacimiento']);
            // If multiple categories, this simple join might duplicate rows or pick one. 
            // Assuming 1 category per player for now or GROUP BY if needed. 
            // Given the pivot, a player could have multiple. For list view, maybe GROUP_CONCAT?
            // For simplicity let's stick to this, it picks one if multiple.
        }

        return $players;
    }

    public function findWithAge($id)
    {
        $sql = "
            SELECT j.*, 
                   c.nombre as categoria_nombre, 
                   c.id as categoria_id,
                   d.ruta_archivo as foto_url
            FROM {$this->table} j
            LEFT JOIN categoria_jugador cj ON j.id = cj.jugador_id
            LEFT JOIN categorias c ON cj.categoria_id = c.id
            LEFT JOIN documentos d ON j.id = d.jugador_id AND d.tipo = 'foto'
            WHERE j.id = :id
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $player = $stmt->fetch();

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

    public function assignCategory($playerId, $categoryId)
    {
        // Clear existing
        $del = $this->db->prepare("DELETE FROM categoria_jugador WHERE jugador_id = :id");
        $del->execute([':id' => $playerId]);

        // Add new if valid
        if ($categoryId) {
            $ins = $this->db->prepare("INSERT INTO categoria_jugador (categoria_id, jugador_id) VALUES (:cid, :jid)");
            return $ins->execute([':cid' => $categoryId, ':jid' => $playerId]);
        }
        return true;
    }
}
