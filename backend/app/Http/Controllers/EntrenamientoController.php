<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use PDO;

class EntrenamientoController extends Controller
{

    private $model;

    public function __construct()
    {
        $this->model = new \App\Models\Entrenamiento();
    }

    public function index()
    {
        return $this->json($this->model->findAllWithDetails());
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $insertData = [
            'categoria_id' => $data['categoria_id'],
            'equipo_id' => !empty($data['equipo_id']) ? $data['equipo_id'] : null,
            'fecha' => $data['fecha'],
            'hora' => $data['hora'],
            'lugar' => $data['lugar'] ?? 'Cancha Principal',
            'tema' => $data['tema'] ?? '',
            'observaciones' => $data['observaciones'] ?? ''
        ];

        $id = $this->model->create($insertData);
        return $this->json(['message' => 'Entrenamiento programado', 'id' => $id]);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $updateData = [
            'categoria_id' => $data['categoria_id'],
            'equipo_id' => !empty($data['equipo_id']) ? $data['equipo_id'] : null,
            'fecha' => $data['fecha'],
            'hora' => $data['hora'],
            'lugar' => $data['lugar'],
            'tema' => $data['tema'],
            'observaciones' => $data['observaciones'],
            'estado' => $data['estado']
        ];

        $this->model->update($id, $updateData);
        return $this->json(['message' => 'Entrenamiento actualizado']);
    }

    public function destroy($id)
    {
        $this->model->delete($id);
        return $this->json(['message' => 'Entrenamiento eliminado']);
    }

    public function getAsistencia($id)
    {
        return $this->json($this->model->getAsistencia($id));
    }

    public function saveAsistencia($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        try {
            $this->model->saveAsistencia($id, $data['asistencias']);
            return $this->json(['message' => 'Asistencia guardada']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }
}
