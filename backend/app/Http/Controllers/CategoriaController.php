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

        $currentYear = date('Y');

        // Logic for anio_fin & Validation
        if ($data['tipo'] === 'anual') {
            $data['anio_fin'] = $data['anio_inicio']; // Anual is single year

            // Validation: Age 5 to 18
            // Start Year implies the birth year. 
            // Age = Current Year - Birth Year (approx).
            // Example: Born 2021. In 2026, Age = 5. OK.
            // Born 2008. In 2026, Age = 18. OK.
            // Born 2007. In 2026. Age = 19. Fail.

            $age = $currentYear - $data['anio_inicio'];
            if ($age < 5 || $age > 18) {
                return $this->json(['message' => "Para categorías anuales, la edad debe estar entre 5 y 18 años. (Calculada: $age años)"], 400);
            }
        } else {
            // Bianual
            if (!isset($data['anio_fin'])) {
                $data['anio_fin'] = $data['anio_inicio'] + 1;
            }
            if ($data['anio_fin'] < $data['anio_inicio']) {
                return $this->json(['message' => 'Año fin debe ser mayor o igual a año inicio'], 400);
            }
        }

        $id = $this->model->create($data);
        return $this->json(['message' => 'Categoría creada', 'id' => $id], 201);
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $currentCategory = $this->model->find($id);
        if (!$currentCategory) {
            return $this->json(['message' => 'Categoría no encontrada'], 404);
        }

        // Validate if updating years
        if (isset($data['anio_inicio']) || isset($data['anio_fin'])) {
            $newStart = $data['anio_inicio'] ?? $currentCategory['anio_inicio'];
            $newEnd = $data['anio_fin'] ?? ($data['tipo'] === 'anual' ? $newStart : ($currentCategory['anio_fin'] ?? $newStart + 1));

            // Adjust for Anual logic if changing type or strictly checking
            $type = $data['tipo'] ?? $currentCategory['tipo'];

            if ($type === 'anual') {
                $newEnd = $newStart; // Enforce equality
                $currentYear = date('Y');
                $age = $currentYear - $newStart;
                if ($age < 5 || $age > 18) {
                    return $this->json(['message' => "Para categorías anuales, la edad debe estar entre 5 y 18 años. (Calculada: $age años)"], 400);
                }
            } else {
                // Bianual checks
                if ($newEnd < $newStart) {
                    return $this->json(['message' => 'Año fin debe ser mayor o igual a año inicio'], 400);
                }
            }

            // REASSIGNMENT LOGIC
            // Only if years changed and it's bianual (as per user request "cuando yo edite los años... suba automáticamente")
            // Even validation implies we should check players.
            // Let's do it for any change in years.

            if ($newStart != $currentCategory['anio_inicio'] || $newEnd != $currentCategory['anio_fin']) {
                $players = $this->model->getPlayers($id); // Helper in model
                $reassignedCount = 0;

                foreach ($players as $player) {
                    // Extract birth year
                    $dob = new \DateTime($player['fecha_nacimiento']);
                    $birthYear = (int) $dob->format('Y');

                    // Check if still fits in ANY of the new range (inclusive)
                    if ($birthYear >= $newStart && $birthYear <= $newEnd) {
                        continue; // Fits, no change needed
                    }

                    // Does not fit. Find new category.
                    $newCat = $this->model->findCategoryByBirthYear($birthYear);

                    if ($newCat && $newCat['id'] != $id) {
                        // Move player
                        $this->model->assignPlayer($newCat['id'], $player['id']); // Insert new relation
                        // Remove from THIS category?
                        // User said "suba automáticamente... que vienen de la categoría anterior".
                        // Assuming strict move = delete old + insert new.
                        $this->model->removePlayer($id, $player['id']);
                        $reassignedCount++;
                    } else {
                        // No suitable category found. 
                        // Implementation Decision: Remove from current invalid category to keep data clean?
                        // Or keep orphan? "suba" implies movement. If nowhere to move, warn?
                        // For safety, let's remove from the invalid category so they show up as "No Category" instead of "Wrong Category".
                        $this->model->removePlayer($id, $player['id']);
                    }
                }
            }
        }

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
        $showAll = isset($_GET['all']) && $_GET['all'] == 'true';
        return $this->json($this->model->getEligiblePlayers($id, $showAll));
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
    public function removeStaff($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['personal_id'])) {
            return $this->json(['message' => 'Falta personal_id'], 400);
        }
        $this->model->removeStaff($id, $data['personal_id']);
        return $this->json(['message' => 'Personal removido']);
    }
}
