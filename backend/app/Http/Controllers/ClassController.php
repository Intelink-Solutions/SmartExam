<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(SchoolClass::withCount(['students', 'subjects'])->paginate($request->integer('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255', 'unique:classes,name']]);

        return response()->json(SchoolClass::create($data), 201);
    }

    public function show(SchoolClass $class): JsonResponse
    {
        return response()->json($class->load(['students.user', 'subjects.teacher.user']));
    }

    public function update(Request $request, SchoolClass $class): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255', 'unique:classes,name,'.$class->id]]);
        $class->update($data);

        return response()->json($class->refresh());
    }

    public function destroy(SchoolClass $class): JsonResponse
    {
        $class->delete();

        return response()->json(['message' => 'Class deleted']);
    }
}
