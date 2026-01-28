<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\Campeonato;
use App\Core\Validator;

class CampeonatoController extends Controller
{
    private $model;

    public function __construct()
    {
        $this->model = new Campeonato();
    }

    public function index()
    {
        return $this->json($this->model->findAll());
    }

    public function show($id)
    {
        $campeonato = $this->model->findWithCategories($id);
        if (!$campeonato) {
            return $this->json(['message' => 'Campeonato no encontrado'], 404);
        }
        return $this->json($campeonato);
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        if (
            !$validator->validate($data, [
                'nombre' => 'required'
            ])
        ) {
            return $this->json(['errors' => $validator->errors()], 400);
        }

        $id = $this->model->create($data);
        return $this->json(['message' => 'Campeonato creado', 'id' => $id], 201);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->model->update($id, $data);
        return $this->json(['message' => 'Campeonato actualizado']);
    }

    public function destroy($id)
    {
        // Toggle active or delete? Requirement says disable.
        // Assuming table has checks, but soft delete is safer.
        // If table has 'activo', we toggle. 
        // Check schema: campeonatos has 'activo'.
        // Let's implement toggle logic if not in base model or custom
        // For now, let's assume update with active=0 is enough

        $data = ['activo' => 0];
        $this->model->update($id, $data);
        return $this->json(['message' => 'Campeonato deshabilitado']);
    }

    public function assignCategory($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['categoria_id'])) {
            return $this->json(['message' => 'Falta categoria_id'], 400);
        }
        $this->model->assignCategory($id, $data['categoria_id']);
        return $this->json(['message' => 'Categoría asignada']);
    }

    public function removeCategory($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['categoria_id'])) {
            return $this->json(['message' => 'Falta categoria_id'], 400);
        }
        $this->model->removeCategory($id, $data['categoria_id']);
        return $this->json(['message' => 'Categoría removida']);
    }
}
