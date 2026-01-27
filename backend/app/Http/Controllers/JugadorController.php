<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\Jugador;
use App\Core\Validator;

class JugadorController extends Controller
{
    private $model;

    public function __construct()
    {
        $this->model = new Jugador();
    }

    public function index()
    {
        return $this->json($this->model->findAllActiveWithAge());
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        if (
            !$validator->validate($data, [
                'nombre' => 'required',
                'apellido' => 'required',
                'fecha_nacimiento' => 'required', // YYYY-MM-DD
                'cedula' => 'required|min:5'
            ])
        ) {
            return $this->json(['errors' => $validator->errors()], 400);
        }

        // Logic check: Validate not duplicate cedula? Assuming DB unique constraint handles it or check here.
        // For simplicity, rely on DB exception or check manually.

        try {
            $id = $this->model->create($data);
            return $this->json(['message' => 'Jugador registrado', 'id' => $id], 201);
        } catch (\PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                return $this->json(['error' => 'La cédula ya existe.'], 409);
            }
            return $this->json(['error' => 'Error al registrar jugador.'], 500);
        }
    }

    public function destroy($id)
    {
        // Actually soft delete
        $success = $this->model->softDelete($id);
        return $this->json(['success' => $success]);
    }

    public function restore($id)
    {
        $success = $this->model->restore($id);
        return $this->json(['success' => $success]);
    }
}
