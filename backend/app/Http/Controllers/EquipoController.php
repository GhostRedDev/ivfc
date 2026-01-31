<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\Equipo;
use App\Core\Validator;

class EquipoController extends Controller
{
    private $model;

    public function __construct()
    {
        $this->model = new Equipo();
    }

    public function index()
    {
        return $this->json($this->model->findAllWithCategory());
    }

    public function byCategory($categoriaId)
    {
        return $this->json($this->model->findByCategory($categoriaId));
    }

    public function show($id)
    {
        $team = $this->model->find($id);
        if (!$team) {
            return $this->json(['error' => 'Equipo no encontrado'], 404);
        }
        $team['players'] = $this->model->getPlayers($id);
        return $this->json($team);
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        if (!$validator->validate($data, ['nombre' => 'required', 'categoria_id' => 'required'])) {
            return $this->json(['errors' => $validator->errors()], 400);
        }

        $id = $this->model->create($data);
        return $this->json(['message' => 'Equipo creado', 'id' => $id], 201);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->update($id, $data);
        return $this->json(['message' => 'Equipo actualizado']);
    }

    public function destroy($id)
    {
        $this->model->delete($id);
        return $this->json(['message' => 'Equipo eliminado']);
    }

    public function uploadLogo($id)
    {
        if (!isset($_FILES['file'])) {
            return $this->json(['error' => 'No file uploaded'], 400);
        }

        $file = $_FILES['file'];
        $allowed = ['jpg', 'jpeg', 'png', 'webp'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowed)) {
            return $this->json(['error' => 'Invalid format'], 400);
        }

        $filename = 'equipo_' . $id . '_' . time() . '.' . $ext;
        $path = __DIR__ . '/../../public/uploads/equipos/';

        if (!file_exists($path)) {
            mkdir($path, 0777, true);
        }

        if (move_uploaded_file($file['tmp_name'], $path . $filename)) {
            $url = '/uploads/equipos/' . $filename;
            $this->model->update($id, ['logo' => $url]);
            return $this->json(['url' => $url]);
        }

        return $this->json(['error' => 'Upload failed'], 500);
    }
    public function addPlayer($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['jugador_id'])) {
            return $this->json(['error' => 'jugador_id required'], 400);
        }

        if ($this->model->addPlayer($id, $data['jugador_id'])) {
            return $this->json(['message' => 'Jugador agregado al equipo']);
        }
        return $this->json(['error' => 'No se pudo agregar al jugador'], 400);
    }

    public function removePlayer($id, $jugadorId)
    {
        if ($this->model->removePlayer($id, $jugadorId)) {
            return $this->json(['message' => 'Jugador removido del equipo']);
        }
        return $this->json(['error' => 'No se pudo remover al jugador'], 400);
    }
}
