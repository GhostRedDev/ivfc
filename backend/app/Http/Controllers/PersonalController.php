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

    public function toggleActive($id)
    {
        $person = $this->model->find($id);
        if (!$person) {
            return $this->json(['error' => 'Personal not found'], 404);
        }

        if ($person['activo']) {
            $this->model->softDelete($id);
        } else {
            $this->model->restore($id);
        }

        return $this->json(['success' => true]);
    }

    public function uploadPhoto($id)
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

        $filename = 'personal_' . $id . '_' . time() . '.' . $ext;
        $path = __DIR__ . '/../../public/uploads/personal/';

        if (!file_exists($path)) {
            mkdir($path, 0777, true);
        }

        if (move_uploaded_file($file['tmp_name'], $path . $filename)) {
            $url = '/uploads/personal/' . $filename;
            $this->model->update($id, ['foto' => $url]);
            return $this->json(['url' => $url]);
        }

        return $this->json(['error' => 'Upload failed'], 500);
    }
}
