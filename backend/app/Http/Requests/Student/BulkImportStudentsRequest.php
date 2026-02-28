<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class BulkImportStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ];
    }
}
