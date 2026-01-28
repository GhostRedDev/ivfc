<?php

namespace App\Models;

use App\Core\Model;
use PDO;

class Entrenamiento extends Model
{
    protected $table = 'entrenamientos';

    public function findAllWithDetails()
    {
        $stmt = $this->db->prepare("
            SELECT e.*, c.nombre as categoria_nombre, eq.nombre as equipo_nombre 
            FROM {$this->table} e
            LEFT JOIN categorias c ON e.categoria_id = c.id
            LEFT JOIN equipos eq ON e.equipo_id = eq.id
            ORDER BY e.fecha DESC, e.hora ASC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAsistencia($id)
    {
        $sql = "
            SELECT 
                j.id as jugador_id, 
                j.primer_nombre, j.primer_apellido,
                ae.asistio, ae.observacion
            FROM entrenamientos e
            JOIN categoria_jugador cj ON e.categoria_id = cj.categoria_id
            JOIN jugadores j ON cj.jugador_id = j.id
            LEFT JOIN asistencia_entrenamiento ae ON ae.entrenamiento_id = e.id AND ae.jugador_id = j.id
            WHERE e.id = :id AND j.activo = 1
        ";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function saveAsistencia($id, $asistencias)
    {
        $this->beginTransaction();
        try {
            // Clear existing
            $del = $this->db->prepare("DELETE FROM asistencia_entrenamiento WHERE entrenamiento_id = :id");
            $del->execute([':id' => $id]);

            $ins = $this->db->prepare("INSERT INTO asistencia_entrenamiento (entrenamiento_id, jugador_id, asistio, observacion) VALUES (:eid, :jid, :asistio, :obs)");

            foreach ($asistencias as $row) {
                $ins->execute([
                    ':eid' => $id,
                    ':jid' => $row['jugador_id'],
                    ':asistio' => $row['asistio'],
                    ':obs' => $row['observacion'] ?? ''
                ]);
            }

            // Mark realized
            $upd = $this->db->prepare("UPDATE entrenamientos SET estado = 'realizado' WHERE id = :id");
            $upd->execute([':id' => $id]);

            $this->commit();
            return true;
        } catch (\Exception $e) {
            $this->rollBack();
            throw $e;
        }
    }
}
