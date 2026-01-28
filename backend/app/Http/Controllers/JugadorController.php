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
        return $this->json($this->model->findAllWithAge());
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

        // Prepare data with optional fields
        $fillable = [
            'nombre',
            'apellido',
            'primer_nombre',
            'segundo_nombre',
            'primer_apellido',
            'segundo_apellido',
            'fecha_nacimiento',
            'cedula',
            'telefono_contacto',
            'direccion',
            'representante_nombre',
            'representante_cedula',
            'representante_telefono',
            'tipo_sangre',
            'alergias',
            'tiempo_entrenamiento',
            'categoria_objetivo',
            'antecedentes_patologicos',
            'antecedentes_deportivos',
            'antecedentes_academicos',
            'habilidades'
        ];

        $insertData = [];
        foreach ($fillable as $field) {
            $insertData[$field] = $data[$field] ?? null;
        }

        try {
            $this->model->beginTransaction();

            $id = $this->model->create($insertData);

            if (!empty($data['categoria_id'])) {
                $this->model->assignCategory($id, $data['categoria_id']);
            }

            $this->model->commit();
            return $this->json(['message' => 'Jugador registrado', 'id' => $id], 201);
        } catch (\PDOException $e) {
            $this->model->rollBack();
            if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
                return $this->json(['error' => 'La cédula ya existe.'], 409);
            }
            return $this->json(['error' => 'Error al registrar jugador.'], 500);
        }
    }

    public function show($id)
    {
        $player = $this->model->findWithAge($id);
        if (!$player) {
            return $this->json(['error' => 'Jugador no encontrado'], 404);
        }
        return $this->json($player);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // ... existing fillable logic ...
        $fillable = [
            'nombre',
            'apellido',
            'primer_nombre',
            'segundo_nombre',
            'primer_apellido',
            'segundo_apellido',
            'fecha_nacimiento',
            'cedula',
            'telefono_contacto',
            'direccion',
            'representante_nombre',
            'representante_cedula',
            'representante_telefono',
            'tipo_sangre',
            'alergias',
            'tiempo_entrenamiento',
            'categoria_objetivo', // Keep this as "Target Category" text
            'antecedentes_patologicos',
            'antecedentes_deportivos',
            'antecedentes_academicos',
            'habilidades'
        ];

        $updateData = [];
        foreach ($fillable as $field) {
            if (array_key_exists($field, $data)) {
                $updateData[$field] = $data[$field];
            }
        }

        try {
            $this->model->beginTransaction();

            $this->model->update($id, $updateData);

            if (isset($data['categoria_id'])) {
                $this->model->assignCategory($id, $data['categoria_id']);
            }

            $this->model->commit();
            return $this->json(['message' => 'Jugador actualizado']);
        } catch (\PDOException $e) {
            $this->model->rollBack();
            return $this->json(['error' => 'Error al actualizar jugador.'], 500);
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
