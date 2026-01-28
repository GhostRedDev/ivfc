<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\Uniforme;

class UniformeController extends Controller
{
    private $model;

    public function __construct()
    {
        $this->model = new Uniforme();
    }

    public function show($jugadorId)
    {
        $uniforme = $this->model->findByJugador($jugadorId);
        if (!$uniforme) {
            // Return empty structure or 404? 
            // Better to return default 'sin_uniforme' structure for UI
            return $this->json([
                'estado' => 'sin_uniforme',
                'talla_camisa' => '',
                'talla_short' => '',
                'numero_dorsal' => ''
            ]);
        }
        return $this->json($uniforme);
    }

    public function update($jugadorId)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        // check if exists
        $existing = $this->model->findByJugador($jugadorId);

        if ($existing) {
            // Update
            // We need to update by ID, not jugador_id directly using generic update
            // Actually generic update uses 'id'. existing['id']
            $this->model->update($existing['id'], $data);
        } else {
            // Create
            $data['jugador_id'] = $jugadorId;
            $this->model->create($data);
        }

        return $this->json(['message' => 'Uniforme actualizado']);
    }
}
