<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use App\Models\User;
use App\Core\Validator;

class AuthController extends Controller
{
    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        if (
            !$validator->validate($data, [
                'username' => 'required',
                'password' => 'required'
            ])
        ) {
            return $this->json(['errors' => $validator->errors()], 400);
        }

        $userModel = new User();
        $user = $userModel->findByUsername($data['username']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            return $this->json(['error' => 'Credenciales inválidas'], 401);
        }

        // Generate a simple token (In production use JWT)
        $token = bin2hex(random_bytes(16));

        // Return user info and token
        return $this->json([
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ],
            'token' => $token
        ]);
    }
}
