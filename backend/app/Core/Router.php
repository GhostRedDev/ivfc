<?php

namespace App\Core;

class Router
{
    protected $routes = [];

    public function get($path, $callback)
    {
        $this->routes['GET'][$path] = $callback;
    }

    public function post($path, $callback)
    {
        $this->routes['POST'][$path] = $callback;
    }

    public function dispatch()
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // Remove query string and trim slashes
        $path = trim($path, '/');
        
        // Handle root path
        if ($path === '') {
            $path = '/';
        } else {
             $path = '/' . $path;
        }

        $method = $_SERVER['REQUEST_METHOD'];

        if (strpos($path, '/api') === 0) {
             // Basic API prefix handling if needed, or leave it to be defined in routes
        }

        $callback = $this->routes[$method][$path] ?? false;

        if ($callback === false) {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found']);
            return;
        }

        if (is_array($callback)) {
            $controller = new $callback[0];
            $method = $callback[1];
            return call_user_func([$controller, $method]);
        }

        return call_user_func($callback);
    }
}
