<?php

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['sometimes', 'exists:subjects,id'],
            'class_id' => ['sometimes', 'exists:classes,id'],
            'type' => ['sometimes', Rule::in(['mcq', 'true_false', 'essay'])],
            'question_text' => ['sometimes', 'string'],
            'correct_answer' => ['nullable', 'string'],
            'marks' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
