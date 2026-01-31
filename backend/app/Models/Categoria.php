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
            SELECT j.*, cj.categoria_id, cj.equipo_id
            FROM jugadores j
            JOIN categoria_jugador cj ON j.id = cj.jugador_id
            WHERE cj.categoria_id = :id AND j.activo = 1
            ORDER BY j.primer_apellido ASC
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

    public function getEligiblePlayers($categoriaId, $showAll = false)
    {
        $category = $this->find($categoriaId);
        if (!$category)
            return [];

        $startYear = $category['anio_inicio'];
        $endYear = $category['anio_fin'];

        $sql = "
            SELECT * FROM jugadores 
            WHERE 1=1
            " . ($showAll ? "" : "AND YEAR(fecha_nacimiento) BETWEEN :start AND :end") . "
            AND activo = 1
            AND id NOT IN (SELECT jugador_id FROM categoria_jugador WHERE categoria_id = :catId)
            ORDER BY primer_apellido ASC
        ";

        $stmt = $this->db->prepare($sql);

        $params = ['catId' => $categoriaId];
        if (!$showAll) {
            $params['start'] = $startYear;
            $params['end'] = $endYear;
        }

        $stmt->execute($params);
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

    public function findCategoryByBirthYear($birthYear)
    {
        // Find a category that includes this birth year
        // Priorities: Active categories
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table}
            WHERE :year BETWEEN anio_inicio AND anio_fin
            AND activo = 1
            LIMIT 1
        ");
        $stmt->execute(['year' => $birthYear]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
