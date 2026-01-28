<?php

namespace App\Http\Controllers;

use App\Core\Controller;
use PDO;

class AuthController extends Controller
{
    public function login()
    {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["message" => "Faltan datos"]);
            return;
        }

        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = :username LIMIT 1");
        $stmt->bindParam(":username", $data->username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['password'])) {
            // In a real app, use JWT. For now, simple token/session simulation or basic return
            // We'll return the user info (minus password) and a fake token for the frontend to store
            unset($user['password']);
            echo json_encode([
                "message" => "Login exitoso",
                "user" => $user,
                "token" => base64_encode($user['username'] . ':' . time()) // Simple mock token
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Credenciales inválidas"]);
        }
    }

    public function register()
    {
        // Admin only - middleware check should happen in Router or here
        // For simplicity, we assume the frontend sends a secret or we just allow it for now per requirements

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["message" => "Faltan datos"]);
            return;
        }

        // Check if user exists
        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = :username");
        $stmt->bindParam(":username", $data->username);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["message" => "El usuario ya existe"]);
            return;
        }

        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
        $role = isset($data->role) ? $data->role : 'user';

        $stmt = $this->db->prepare("INSERT INTO users (username, password, role) VALUES (:username, :password, :role)");
        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":role", $role);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Usuario registrado exitosamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al registrar usuario"]);
        }
    }

    public function index()
    {
        $stmt = $this->db->prepare("SELECT id, username, role, created_at FROM users");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($users);
    }
}
