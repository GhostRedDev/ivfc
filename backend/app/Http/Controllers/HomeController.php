<?php

namespace App\Http\Controllers;

use App\Core\Controller;

class HomeController extends Controller
{
    public function index()
    {
        return $this->json(['message' => 'Welcome to PHP Native MVC API']);
    }

    public function test()
    {
        return $this->json([
            'status' => 'success',
            'data' => [
                'id' => 1,
                'name' => 'Test Item',
                'description' => 'This is data coming from PHP Backend'
            ]
        ]);
    }
}
