<?php

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'exists:subjects,id'],
            'class_id' => ['required', 'exists:classes,id'],
            'type' => ['required', Rule::in(['mcq', 'true_false', 'essay'])],
            'question_text' => ['required', 'string'],
            'correct_answer' => ['nullable', 'string'],
            'marks' => ['required', 'integer', 'min:1'],
        ];
    }
}
