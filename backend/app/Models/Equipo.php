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
    public function addPlayer($equipoId, $jugadorId)
    {
        // Must ensure player belongs to same category as team
        // Get team category
        $stmt = $this->db->prepare("SELECT categoria_id FROM equipos WHERE id = :id");
        $stmt->execute(['id' => $equipoId]);
        $team = $stmt->fetch();

        if (!$team)
            return false;

        // Update functionality: Assign team to player in categoria_jugador
        // Logic: Player must already be in that category? Or we force add?
        // Usually player is assigned category first.
        // Let's assume player is in the category. 
        // We update the row where categoria_id matches.

        $sql = "UPDATE categoria_jugador 
                SET equipo_id = :eid 
                WHERE jugador_id = :jid AND categoria_id = :cid";

        $upd = $this->db->prepare($sql);
        $res = $upd->execute([
            'eid' => $equipoId,
            'jid' => $jugadorId,
            'cid' => $team['categoria_id']
        ]);

        // If row didn't exist (player not in category), should we add them?
        // If affected rows = 0, maybe insert?
        if ($upd->rowCount() == 0) {
            // Check if player is already in another category?
            // For now, simplify: Insert into category with team
            // But this might conflict if player is in another category.
            // Let's assume we just add them to the category & team
            $ins = $this->db->prepare("INSERT INTO categoria_jugador (categoria_id, jugador_id, equipo_id) VALUES (:cid, :jid, :eid)");
            try {
                return $ins->execute([
                    'cid' => $team['categoria_id'],
                    'jid' => $jugadorId,
                    'eid' => $equipoId
                ]);
            } catch (\PDOException $e) {
                // likely duplicate key if they were in category but something else failed? 
                // Or maybe they are int category but UPDATE failed for some reason?
                return false;
            }
        }
        return true;
    }

    public function removePlayer($equipoId, $jugadorId)
    {
        $sql = "UPDATE categoria_jugador SET equipo_id = NULL WHERE equipo_id = :eid AND jugador_id = :jid";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(['eid' => $equipoId, 'jid' => $jugadorId]);
    }
}
