<?php

// Manually load dependencies
require_once __DIR__ . '/app/Core/Database.php';

use App\Core\Database;

// Connect to DB directly or via Model
$db = Database::getInstance()->getConnection();

echo "Connected to Database.\n";

// List of users to seed
$users = [
    [
        'username' => 'admin',
        'password' => 'admin123',
        'role' => 'admin'
    ],
    [
        'username' => 'entrenador',
        'password' => '123456',
        'role' => 'user' // Logic: 'user' role handles non-admin stuff
    ],
    [
        'username' => 'asistente',
        'password' => '123456',
        'role' => 'user'
    ]
];

foreach ($users as $u) {
    // Check if exists
    $stmt = $db->prepare("SELECT id FROM users WHERE username = :username");
    $stmt->execute(['username' => $u['username']]);

    if ($stmt->rowCount() > 0) {
        echo "Updating User: {$u['username']}...\n";
        // Update password just in case
        $hash = password_hash($u['password'], PASSWORD_DEFAULT);
        $upd = $db->prepare("UPDATE users SET password = :password, role = :role WHERE username = :username");
        $upd->execute(['password' => $hash, 'role' => $u['role'], 'username' => $u['username']]);
    } else {
        echo "Creating User: {$u['username']}...\n";
        $hash = password_hash($u['password'], PASSWORD_DEFAULT);
        $ins = $db->prepare("INSERT INTO users (username, password, role) VALUES (:username, :password, :role)");
        $ins->execute(['username' => $u['username'], 'password' => $hash, 'role' => $u['role']]);
    }
}

echo "Seeding Complete.\n";