<?php

namespace App\Core;

class Router
{
    protected $routes = [];

    public function get($path, $callback)
    {
        $this->addRoute('GET', $path, $callback);
    }

    public function post($path, $callback)
    {
        $this->addRoute('POST', $path, $callback);
    }

    public function put($path, $callback)
    {
        $this->addRoute('PUT', $path, $callback);
    }

    public function delete($path, $callback)
    {
        $this->addRoute('DELETE', $path, $callback);
    }

    private function addRoute($method, $path, $callback)
    {
        // Convert route parameters to regex (e.g., {id} => ([^/]+))
        $pattern = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([^/]+)', $path);
        // Add start/end delimiters
        $pattern = "#^" . $pattern . "$#";

        $this->routes[$method][$pattern] = [
            'callback' => $callback,
            'original_path' => $path // fallback/debug
        ];
    }

    public function dispatch()
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // Remove trailing slash if not root
        $uri = ($uri === '/') ? $uri : rtrim($uri, '/');

        $method = $_SERVER['REQUEST_METHOD'];

        if (!isset($this->routes[$method])) {
            $this->sendNotFound();
            return;
        }

        foreach ($this->routes[$method] as $pattern => $route) {
            if (preg_match($pattern, $uri, $matches)) {
                array_shift($matches); // Remove full match
                $callback = $route['callback'];

                if (is_array($callback)) {
                    $controllerName = $callback[0];
                    $methodName = $callback[1];
                    $controller = new $controllerName();

                    // Call the method with extracted params
                    call_user_func_array([$controller, $methodName], $matches);
                } else {
                    call_user_func_array($callback, $matches);
                }
                return;
            }
        }

        $this->sendNotFound();
    }

    private function sendNotFound()
    {
        header("HTTP/1.0 404 Not Found");
        echo json_encode(['error' => 'Route not found']);
    }

    // Helper to cleanup/compatibility if needed
    public static function cleanup()
    {
        // No-op
    }
}
