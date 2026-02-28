<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function topStudents(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return response()->json($this->reportService->topStudents($data['class_id'], $data['limit'] ?? 10));
    }

    public function failed(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'pass_mark' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        return response()->json($this->reportService->failedStudents($data['class_id'], (float) ($data['pass_mark'] ?? 50)));
    }

    public function performance(Request $request): JsonResponse
    {
        $data = $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'term_id' => ['required', 'integer', 'exists:terms,id'],
        ]);

        return response()->json([
            'grade_distribution' => $this->reportService->gradeDistribution($data['class_id']),
            'subject_performance' => $this->reportService->subjectPerformanceSummary($data['class_id'], $data['term_id']),
            'class_average_per_subject' => $this->reportService->classAveragePerSubject($data['class_id'], $data['term_id']),
        ]);
    }
}
