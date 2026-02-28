<?php

namespace App\Http\Requests\Result;

use Illuminate\Foundation\Http\FormRequest;

class GenerateResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'class_id' => ['required', 'exists:classes,id'],
            'term_id' => ['required', 'exists:terms,id'],
        ];
    }
}
