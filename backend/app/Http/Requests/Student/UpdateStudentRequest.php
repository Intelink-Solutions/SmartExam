<?php

namespace App\Http\Requests\Student;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $studentRoute = $this->route('student');
        $studentModel = $studentRoute instanceof Student ? $studentRoute : Student::find($studentRoute);
        $userId = $studentModel?->user_id;
        $studentId = $studentModel?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'class_id' => ['sometimes', 'exists:classes,id'],
            'student_id' => ['sometimes', 'string', 'max:100', Rule::unique('students', 'student_id')->ignore($studentId)],
            'photo' => ['nullable', 'image', 'max:2048'],
            'status' => ['nullable', 'in:active,inactive'],
        ];
    }
}
