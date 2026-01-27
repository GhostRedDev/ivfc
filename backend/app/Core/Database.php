<?php

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        $config = require __DIR__ . '/../../config/database.php';

        $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";

        try {
            $this->connection = new PDO($dsn, $config['username'], $config['password'], $config['options']);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }
}
