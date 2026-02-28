<?php

namespace App\Http\Controllers;

use App\Http\Requests\Student\BulkImportStudentsRequest;
use App\Http\Requests\Student\PromoteStudentRequest;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function __construct(private readonly StudentService $studentService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $students = Student::with(['user', 'schoolClass'])->paginate($request->integer('per_page', 20));

        return response()->json($students);
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = $this->studentService->create($request->validated(), $request->file('photo'));

        return response()->json($student->load(['user', 'schoolClass']), 201);
    }

    public function show(Student $student): JsonResponse
    {
        return response()->json($student->load(['user', 'schoolClass', 'results.term']));
    }

    public function update(UpdateStudentRequest $request, Student $student): JsonResponse
    {
        $updated = $this->studentService->update($student, $request->validated(), $request->file('photo'));

        return response()->json($updated->load(['user', 'schoolClass']));
    }

    public function destroy(Student $student): JsonResponse
    {
        $this->studentService->delete($student);

        return response()->json(['message' => 'Student deleted']);
    }

    public function promote(PromoteStudentRequest $request, Student $student): JsonResponse
    {
        $promoted = $this->studentService->promote($student, (int) $request->validated('class_id'));

        return response()->json($promoted->load(['user', 'schoolClass']));
    }

    public function deactivate(Student $student): JsonResponse
    {
        return response()->json($this->studentService->deactivate($student));
    }

    public function bulkImport(BulkImportStudentsRequest $request): JsonResponse
    {
        $result = $this->studentService->bulkImport($request->file('file')->getRealPath());

        return response()->json($result);
    }
}
