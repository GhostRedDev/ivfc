<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\Categoria;
use App\Core\Validator;

class CategoriaController extends Controller
{
    private $model;

    public function __construct()
    {
        $this->model = new Categoria();
    }

    public function index()
    {
        return $this->json($this->model->findAll());
    }

    public function show($id)
    {
        $category = $this->model->findWithDetails($id);
        if (!$category) {
            return $this->json(['message' => 'Categoría no encontrada'], 404);
        }
        return $this->json($category);
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        if (
            !$validator->validate($data, [
                'nombre' => 'required',
                'tipo' => 'required', // anual, bianual
                'anio_inicio' => 'required|numeric',
            ])
        ) {
            return $this->json(['errors' => $validator->errors()], 400);
        }

        // Logic for anio_fin
        if ($data['tipo'] === 'anual') {
            $data['anio_fin'] = $data['anio_inicio'];
        } else {
            // Biannual: user must provide it or we default only if not set? 
            // Expecting user to provide it or calculate logic? 
            // Simplest: if biannual, check if supplied. If not, maybe error or assume +1?
            // Let's assume frontend sends it.
            if (!isset($data['anio_fin'])) {
                $data['anio_fin'] = $data['anio_inicio'] + 1;
            }
        }

        $id = $this->model->create($data);
        return $this->json(['message' => 'Categoría creada', 'id' => $id], 201);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->update($id, $data);
        return $this->json(['message' => 'Categoría actualizada']);
    }

    public function toggleActive($id)
    {
        $this->model->toggleActive($id);
        return $this->json(['message' => 'Estado actualizado']);
    }

    public function getEligiblePlayers($id)
    {
        return $this->json($this->model->getEligiblePlayers($id));
    }

    public function assignPlayer($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['jugador_id'])) {
            return $this->json(['message' => 'Falta jugador_id'], 400);
        }
        $this->model->assignPlayer($id, $data['jugador_id']);
        return $this->json(['message' => 'Jugador asignado']);
    }

    public function removePlayer($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['jugador_id'])) {
            return $this->json(['message' => 'Falta jugador_id'], 400);
        }
        $this->model->removePlayer($id, $data['jugador_id']);
        return $this->json(['message' => 'Jugador removido']);
    }

    public function assignPlayerToTeam($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['jugador_id'])) {
            return $this->json(['message' => 'Falta jugador_id'], 400);
        }

        // This method needs to update the pivot table 'categoria_jugador' setting 'equipo_id'
        // where categoria_id = $id and jugador_id = $data['jugador_id']
        // We can do this in the Model.

        $this->model->assignPlayerToTeam($id, $data['jugador_id'], $data['equipo_id'] ?? null);
        return $this->json(['message' => 'Asignación de equipo actualizada']);
    }

    // Staff assignment similarly...
    public function assignStaff($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['personal_id'])) {
            return $this->json(['message' => 'Falta personal_id'], 400);
        }
        $rol = $data['rol'] ?? 'Entrenador';
        $this->model->assignStaff($id, $data['personal_id'], $rol);
        return $this->json(['message' => 'Personal asignado']);
    }
}
