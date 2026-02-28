<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'class_id' => ['required', 'exists:classes,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'term_id' => ['required', 'exists:terms,id'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'total_marks' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', Rule::in(['draft', 'active', 'closed'])],
            'exam_date' => ['required', 'date'],
        ];
    }
}
