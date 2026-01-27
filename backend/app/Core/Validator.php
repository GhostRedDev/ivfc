<?php

namespace App\Core;

class Validator
{
    protected $errors = [];

    public function validate(array $data, array $rules)
    {
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $ruleList = explode('|', $fieldRules);

            foreach ($ruleList as $rule) {
                if ($rule === 'required' && empty($value)) {
                    $this->errors[$field][] = "El campo {$field} es requerido.";
                }

                if (strpos($rule, 'min:') === 0) {
                    $min = substr($rule, 4);
                    if (strlen($value) < $min) {
                        $this->errors[$field][] = "El campo {$field} debe tener al menos {$min} caracteres.";
                    }
                }

                if ($rule === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->errors[$field][] = "El campo {$field} debe ser un email válido.";
                }
            }
        }

        return empty($this->errors);
    }

    public function errors()
    {
        return $this->errors;
    }
}
