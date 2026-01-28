<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Campeonato extends Model
{
    protected $table = 'campeonatos';

    public function findWithCategories($id)
    {
        $campeonato = $this->find($id);
        if (!$campeonato)
            return null;

        $campeonato['categorias'] = $this->getCategories($id);
        return $campeonato;
    }

    public function getCategories($campeonatoId)
    {
        $stmt = $this->db->prepare("
            SELECT c.* 
            FROM categorias c
            JOIN campeonato_categorias cc ON c.id = cc.categoria_id
            WHERE cc.campeonato_id = :id
        ");
        $stmt->execute(['id' => $campeonatoId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function assignCategory($campeonatoId, $categoriaId)
    {
        $stmt = $this->db->prepare("INSERT IGNORE INTO campeonato_categorias (campeonato_id, categoria_id) VALUES (:cid, :catid)");
        return $stmt->execute(['cid' => $campeonatoId, 'catid' => $categoriaId]);
    }

    public function removeCategory($campeonatoId, $categoriaId)
    {
        $stmt = $this->db->prepare("DELETE FROM campeonato_categorias WHERE campeonato_id = :cid AND categoria_id = :catid");
        return $stmt->execute(['cid' => $campeonatoId, 'catid' => $categoriaId]);
    }
}
