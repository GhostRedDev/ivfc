<?php

use App\Core\Router;
use App\Http\Controllers\HomeController;

$router = new Router();

$router->get('/', [HomeController::class, 'index']);
$router->get('/api/test', [HomeController::class, 'test']);

use App\Http\Controllers\AuthController;
$router->post('/api/login', [AuthController::class, 'login']);

use App\Http\Controllers\PersonalController;
$router->get('/api/personal', [PersonalController::class, 'index']);
$router->post('/api/personal', [PersonalController::class, 'store']);

use App\Http\Controllers\JugadorController;
$router->get('/api/jugadores', [JugadorController::class, 'index']);
$router->post('/api/jugadores', [JugadorController::class, 'store']);

return $router;
