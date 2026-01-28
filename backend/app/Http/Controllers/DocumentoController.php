<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\Documento;

class DocumentoController extends Controller
{
    private $model;

    public function __construct()
    {
        $this->model = new Documento();
    }

    public function index($jugadorId)
    {
        return $this->json($this->model->findByJugador($jugadorId));
    }

    public function store($jugadorId)
    {
        if (!isset($_FILES['file'])) {
            return $this->json(['message' => 'No se ha subido ningún archivo'], 400);
        }

        $file = $_FILES['file'];
        $tipo = $_POST['tipo'] ?? 'otro';

        $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowed)) {
            return $this->json(['message' => 'Formato no permitido'], 400);
        }

        $uploadDir = __DIR__ . '/../../public/uploads/docs/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filename = uniqid() . '_' . time() . '.' . $ext;
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $data = [
                'jugador_id' => $jugadorId,
                'tipo' => $tipo,
                'ruta_archivo' => '/uploads/docs/' . $filename,
                'formato' => $ext
            ];
            $id = $this->model->create($data);
            return $this->json(['message' => 'Documento subido', 'id' => $id, 'path' => $data['ruta_archivo']], 201);
        }

        return $this->json(['message' => 'Error al guardar el archivo'], 500);
    }

    public function destroy($id)
    {
        $doc = $this->model->find($id);
        if ($doc) {
            // Delete physical file
            $filePath = __DIR__ . '/../../public' . $doc['ruta_archivo'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
            $this->model->delete($id);
            return $this->json(['message' => 'Documento eliminado']);
        }
        return $this->json(['message' => 'Documento no encontrado'], 404);
    }
}
