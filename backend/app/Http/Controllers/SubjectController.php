<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Subject::with(['schoolClass', 'teacher.user'])->paginate($request->integer('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'class_id' => ['required', 'exists:classes,id'],
            'teacher_id' => ['required', 'exists:teachers,id'],
        ]);

        $subject = Subject::create($data);

        return response()->json($subject->load(['schoolClass', 'teacher.user']), 201);
    }

    public function show(Subject $subject): JsonResponse
    {
        return response()->json($subject->load(['schoolClass', 'teacher.user', 'questions']));
    }

    public function update(Request $request, Subject $subject): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'class_id' => ['sometimes', 'exists:classes,id'],
            'teacher_id' => ['sometimes', 'exists:teachers,id'],
        ]);

        $subject->update($data);

        return response()->json($subject->refresh()->load(['schoolClass', 'teacher.user']));
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $subject->delete();

        return response()->json(['message' => 'Subject deleted']);
    }
}
