<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(Teacher::with(['user', 'subjects.schoolClass'])->paginate($request->integer('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $teacher = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'teacher',
            ]);

            return Teacher::create([
                'user_id' => $user->id,
            ]);
        });

        return response()->json($teacher->load(['user', 'subjects.schoolClass']), 201);
    }

    public function show(Teacher $teacher): JsonResponse
    {
        return response()->json($teacher->load(['user', 'subjects']));
    }

    public function update(Request $request, Teacher $teacher): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($teacher->user_id)],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $payload = [];

        if (array_key_exists('name', $data)) {
            $payload['name'] = $data['name'];
        }

        if (array_key_exists('email', $data)) {
            $payload['email'] = $data['email'];
        }

        if (! empty($data['password'])) {
            $payload['password'] = $data['password'];
        }

        if ($payload) {
            $teacher->user->update($payload);
        }

        return response()->json($teacher->refresh()->load(['user', 'subjects.schoolClass']));
    }

    public function destroy(Teacher $teacher): JsonResponse
    {
        if ($teacher->subjects()->exists()) {
            return response()->json([
                'message' => 'Cannot delete teacher with assigned subjects. Reassign subjects first.',
            ], 422);
        }

        $teacher->user->delete();

        return response()->json(['message' => 'Teacher deleted']);
    }
}
