<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class PromoteStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'class_id' => ['required', 'exists:classes,id'],
        ];
    }
}
