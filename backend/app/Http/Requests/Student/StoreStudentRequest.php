<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'class_id' => ['required', 'exists:classes,id'],
            'student_id' => ['required', 'string', 'max:100', 'unique:students,student_id'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }
}
