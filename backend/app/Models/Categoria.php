<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Categoria extends Model
{
    protected $table = 'categorias';

    public function findWithDetails($id)
    {
        $category = $this->find($id);
        if (!$category)
            return null;

        $category['players'] = $this->getPlayers($id);
        $category['staff'] = $this->getStaff($id);
        return $category;
    }

    public function getPlayers($categoriaId)
    {
        $stmt = $this->db->prepare("
            SELECT j.*, cj.categoria_id 
            FROM jugadores j
            JOIN categoria_jugador cj ON j.id = cj.jugador_id
            WHERE cj.categoria_id = :id AND j.activo = 1
            ORDER BY j.apellido ASC
        ");
        $stmt->execute(['id' => $categoriaId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStaff($categoriaId)
    {
        $stmt = $this->db->prepare("
            SELECT p.*, cp.rol as rol_en_categoria
            FROM personal p
            JOIN categoria_personal cp ON p.id = cp.personal_id
            WHERE cp.categoria_id = :id AND p.activo = 1
        ");
        $stmt->execute(['id' => $categoriaId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEligiblePlayers($categoriaId)
    {
        $category = $this->find($categoriaId);
        if (!$category)
            return [];

        $startYear = $category['anio_inicio'];
        $endYear = $category['anio_fin'];

        // Logic: Players born in these years
        // We need to extract year from fecha_nacimiento
        $stmt = $this->db->prepare("
            SELECT * FROM jugadores 
            WHERE YEAR(fecha_nacimiento) BETWEEN :start AND :end 
            AND activo = 1
            AND id NOT IN (SELECT jugador_id FROM categoria_jugador WHERE categoria_id = :catId)
            ORDER BY apellido ASC
        ");
        $stmt->execute([
            'start' => $startYear,
            'end' => $endYear,
            'catId' => $categoriaId
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function assignPlayer($categoriaId, $jugadorId)
    {
        // Optional: Check eligibility again securely?
        // For now, trust controller/UI
        $stmt = $this->db->prepare("INSERT IGNORE INTO categoria_jugador (categoria_id, jugador_id) VALUES (:cid, :jid)");
        return $stmt->execute(['cid' => $categoriaId, 'jid' => $jugadorId]);
    }

    public function removePlayer($categoriaId, $jugadorId)
    {
        $stmt = $this->db->prepare("DELETE FROM categoria_jugador WHERE categoria_id = :cid AND jugador_id = :jid");
        return $stmt->execute(['cid' => $categoriaId, 'jid' => $jugadorId]);
    }

    public function assignStaff($categoriaId, $personalId, $rol)
    {
        $stmt = $this->db->prepare("INSERT IGNORE INTO categoria_personal (categoria_id, personal_id, rol) VALUES (:cid, :pid, :rol)");
        return $stmt->execute(['cid' => $categoriaId, 'pid' => $personalId, 'rol' => $rol]);
    }

    public function removeStaff($categoriaId, $personalId)
    {
        $stmt = $this->db->prepare("DELETE FROM categoria_personal WHERE categoria_id = :cid AND personal_id = :pid");
        return $stmt->execute(['cid' => $categoriaId, 'pid' => $personalId]);
    }

    public function assignPlayerToTeam($categoryId, $playerId, $teamId)
    {
        $stmt = $this->db->prepare("UPDATE categoria_jugador SET equipo_id = :eid WHERE categoria_id = :cid AND jugador_id = :jid");
        return $stmt->execute([':eid' => $teamId, ':cid' => $categoryId, ':jid' => $playerId]);
    }

    public function toggleActive($id)
    {
        $current = $this->find($id);
        $newState = $current['activo'] ? 0 : 1;
        $stmt = $this->db->prepare("UPDATE {$this->table} SET activo = :active WHERE id = :id");
        return $stmt->execute(['active' => $newState, 'id' => $id]);
    }
}
