<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\Personal;
use App\Core\Validator;

class PersonalController extends Controller
{
    private $model;

    public function __construct()
    {
        $this->model = new Personal();
    }

    public function index()
    {
        return $this->json($this->model->findAll());
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        if (
            !$validator->validate($data, [
                'nombre' => 'required|min:3',
                'apellido' => 'required|min:3',
                'cargo' => 'required'
            ])
        ) {
            return $this->json(['errors' => $validator->errors()], 400);
        }

        $id = $this->model->create($data);
        return $this->json(['message' => 'Personal registrado', 'id' => $id], 201);
    }

    public function update($id) // Placeholder, router needs dynamic ID support
    {
        // Implementation for update
    }

    public function destroy($id)
    {
        // Actually soft delete
        $success = $this->model->softDelete($id);
        return $this->json(['success' => $success]);
    }
}
