<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\Pago;

class PagoController extends Controller
{
    private $model;

    public function __construct()
    {
        $this->model = new Pago();
    }

    public function index($jugadorId)
    {
        return $this->json($this->model->findByJugador($jugadorId));
    }

    public function indexPersonal($personalId)
    {
        return $this->json($this->model->findByPersonal($personalId));
    }

    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if ((!isset($data['jugador_id']) && !isset($data['personal_id'])) || !isset($data['monto'])) {
            return $this->json(['message' => 'Faltan datos (jugador_id o personal_id y monto)'], 400);
        }

        $id = $this->model->create($data);
        return $this->json(['message' => 'Pago registrado', 'id' => $id], 201);
    }
}
