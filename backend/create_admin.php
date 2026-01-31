<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/app/Core/Database.php';

use App\Core\Database;

$db = Database::getInstance()->getConnection();

$username = 'admin';
$password = 'admin123';
$role = 'admin';

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Check if user exists
$stmt = $db->prepare("SELECT id FROM users WHERE username = :username");
$stmt->execute(['username' => $username]);
$user = $stmt->fetch();

if ($user) {
    // Update
    $stmt = $db->prepare("UPDATE users SET password = :password, role = :role WHERE username = :username");
    $stmt->execute([
        'password' => $hashed_password,
        'role' => $role,
        'username' => $username
    ]);
    echo "User 'admin' updated successfully.\n";
} else {
    // Insert
    $stmt = $db->prepare("INSERT INTO users (username, password, role) VALUES (:username, :password, :role)");
    $stmt->execute([
        'username' => $username,
        'password' => $hashed_password,
        'role' => $role
    ]);
    echo "User 'admin' created successfully.\n";
}
