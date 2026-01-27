<?php

namespace App\Models;

use App\Core\Model;

class Personal extends Model
{
    protected $table = 'personal';

    public function findAllActive()
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE activo = 1");
        $stmt->execute();
        return $stmt->fetchAll();
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
