<?php

namespace App\Core;

class Controller
{
    public function json($data, $status = 200)
    {
        header('Content-Type: application/json');
        http_response_code($status);
        echo json_encode($data);
    }
}
