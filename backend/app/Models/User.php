<?php

namespace App\Models;

use App\Core\Model;

class User extends Model
{
    protected $table = 'users';

    public function findByUsername($username)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE username = :username");
        $stmt->execute(['username' => $username]);
        return $stmt->fetch();
    }
}
