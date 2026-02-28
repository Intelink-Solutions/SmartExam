<?php

namespace App\Http\Controllers;

use App\Http\Requests\Question\StoreQuestionRequest;
use App\Http\Requests\Question\UpdateQuestionRequest;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Question::with(['subject', 'schoolClass']);

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->integer('subject_id'));
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->integer('class_id'));
        }

        return response()->json($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreQuestionRequest $request): JsonResponse
    {
        $question = Question::create($request->validated());

        return response()->json($question->load(['subject', 'schoolClass']), 201);
    }

    public function show(Question $question): JsonResponse
    {
        return response()->json($question->load(['subject', 'schoolClass']));
    }

    public function update(UpdateQuestionRequest $request, Question $question): JsonResponse
    {
        $question->update($request->validated());

        return response()->json($question->load(['subject', 'schoolClass']));
    }

    public function destroy(Question $question): JsonResponse
    {
        $question->delete();

        return response()->json(['message' => 'Question deleted']);
    }

    public function bulkImport(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $rows = array_map('str_getcsv', file($request->file('file')->getRealPath()));
        $imported = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            if ($index === 0) {
                continue;
            }

            try {
                if (count($row) < 6) {
                    throw new \RuntimeException('Invalid column count. Expected: subject_id,class_id,type,question_text,correct_answer,marks');
                }

                [$subjectId, $classId, $type, $questionText, $correctAnswer, $marks] = $row;

                $payload = [
                    'subject_id' => (int) trim($subjectId),
                    'class_id' => (int) trim($classId),
                    'type' => trim($type),
                    'question_text' => trim($questionText),
                    'correct_answer' => trim($correctAnswer) !== '' ? trim($correctAnswer) : null,
                    'marks' => (int) trim($marks),
                ];

                validator($payload, [
                    'subject_id' => ['required', 'exists:subjects,id'],
                    'class_id' => ['required', 'exists:classes,id'],
                    'type' => ['required', 'in:mcq,true_false,essay'],
                    'question_text' => ['required', 'string'],
                    'correct_answer' => ['nullable', 'string'],
                    'marks' => ['required', 'integer', 'min:1'],
                ])->validate();

                DB::transaction(fn () => Question::create($payload));
                $imported++;
            } catch (\Throwable $exception) {
                $errors[] = [
                    'row' => $index + 1,
                    'message' => $exception->getMessage(),
                ];
            }
        }

        return response()->json([
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }
}
