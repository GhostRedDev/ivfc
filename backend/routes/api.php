<?php

use App\Core\Router;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\EquipoController;
use App\Http\Controllers\CampeonatoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PersonalController;
use App\Http\Controllers\EntrenamientoController;
use App\Http\Controllers\JugadorController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\UniformeController;
use App\Http\Controllers\PagoController;

$router = new Router();

$router->get('/', [HomeController::class, 'index']);
$router->get('/api/test', [HomeController::class, 'test']);

// Auth Routes
$router->post('/api/register', [AuthController::class, 'register']);
$router->post('/api/login', [AuthController::class, 'login']);
$router->get('/api/users', [AuthController::class, 'index']);

// Personal Routes
$router->get('/api/personal', [PersonalController::class, 'index']);
$router->post('/api/personal', [PersonalController::class, 'store']);
$router->post('/api/personal/{id}/toggle-active', [PersonalController::class, 'toggleActive']);
$router->post('/api/personal/{id}/photo', [PersonalController::class, 'uploadPhoto']);

// Entrenamientos
$router->get('/api/entrenamientos', [EntrenamientoController::class, 'index']);
$router->post('/api/entrenamientos', [EntrenamientoController::class, 'store']);
$router->put('/api/entrenamientos/{id}', [EntrenamientoController::class, 'update']);
$router->delete('/api/entrenamientos/{id}', [EntrenamientoController::class, 'destroy']);
$router->get('/api/entrenamientos/{id}/asistencia', [EntrenamientoController::class, 'getAsistencia']);
$router->post('/api/entrenamientos/{id}/asistencia', [EntrenamientoController::class, 'saveAsistencia']);

// Jugadores Routes (Existing)
$router->get('/api/jugadores', [JugadorController::class, 'index']);
$router->get('/api/jugadores/{id}', [JugadorController::class, 'show']); // New show route
$router->post('/api/jugadores', [JugadorController::class, 'store']);
$router->put('/api/jugadores/{id}', [JugadorController::class, 'update']); // New update route
$router->delete('/api/jugadores/{id}', [JugadorController::class, 'destroy']); // Soft delete
$router->post('/api/jugadores/{id}/restore', [JugadorController::class, 'restore']);

// Categorias Routes
$router->get('/api/categorias', [CategoriaController::class, 'index']);
$router->get('/api/categorias/{id}', [CategoriaController::class, 'show']);
$router->post('/api/categorias', [CategoriaController::class, 'store']);
$router->put('/api/categorias/{id}', [CategoriaController::class, 'update']);
$router->post('/api/categorias/{id}/toggle-active', [CategoriaController::class, 'toggleActive']);
$router->get('/api/categorias/{id}/players', [CategoriaController::class, 'getEligiblePlayers']);
$router->post('/api/categorias/{id}/assign-player', [CategoriaController::class, 'assignPlayer']);
$router->post('/api/categorias/{id}/remove-player', [CategoriaController::class, 'removePlayer']);
$router->post('/api/categorias/{id}/assign-player-team', [CategoriaController::class, 'assignPlayerToTeam']);

// Teams (Equipos)
$router->get('/api/equipos', [EquipoController::class, 'index']);
$router->get('/api/equipos/{id}', [EquipoController::class, 'show']); // New show route
$router->get('/api/categorias/{id}/equipos', [EquipoController::class, 'byCategory']);
$router->post('/api/equipos', [EquipoController::class, 'store']);
$router->put('/api/equipos/{id}', [EquipoController::class, 'update']);
$router->delete('/api/equipos/{id}', [EquipoController::class, 'destroy']);
$router->post('/api/equipos/{id}/logo', [EquipoController::class, 'uploadLogo']);

$router->post('/api/categorias/{id}/assign-staff', [CategoriaController::class, 'assignStaff']);

// Campeonatos Routes
$router->get('/api/campeonatos', [CampeonatoController::class, 'index']);
$router->get('/api/campeonatos/{id}', [CampeonatoController::class, 'show']);
$router->post('/api/campeonatos', [CampeonatoController::class, 'store']);
$router->put('/api/campeonatos/{id}', [CampeonatoController::class, 'update']);
$router->post('/api/campeonatos/{id}/assign-category', [CampeonatoController::class, 'assignCategory']);
$router->post('/api/campeonatos/{id}/remove-category', [CampeonatoController::class, 'removeCategory']);
// Soft delete/disable
$router->delete('/api/campeonatos/{id}', [CampeonatoController::class, 'destroy']);

// Documentos (Files) Routes
$router->get('/api/jugadores/{id}/documentos', [DocumentoController::class, 'index']);
$router->post('/api/jugadores/{id}/documentos', [DocumentoController::class, 'store']);
$router->delete('/api/documentos/{id}', [DocumentoController::class, 'destroy']);

// Uniformes
$router->get('/api/jugadores/{id}/uniforme', [UniformeController::class, 'show']);
$router->put('/api/jugadores/{id}/uniforme', [UniformeController::class, 'update']); // Use PUT/POST to update

// Pagos
$router->get('/api/jugadores/{id}/pagos', [PagoController::class, 'index']);
$router->post('/api/pagos', [PagoController::class, 'store']);

\App\Core\Router::cleanup(); // Optional helper if exists, or just end
return $router;


