<?php

namespace App\Http\Controllers;

use App\Http\Requests\Result\GenerateResultRequest;
use App\Models\GradingScale;
use App\Services\ResultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ResultController extends Controller
{
    public function __construct(private readonly ResultService $resultService)
    {
    }

    public function generate(GenerateResultRequest $request): JsonResponse
    {
        $results = $this->resultService->generate(
            (int) $request->validated('class_id'),
            (int) $request->validated('term_id')
        );

        return response()->json($results);
    }

    public function classResults(int $id): JsonResponse
    {
        return response()->json($this->resultService->classResults($id));
    }

    public function gradingScales(): JsonResponse
    {
        return response()->json(GradingScale::orderByDesc('max_score')->get());
    }

    public function storeGradingScale(Request $request): JsonResponse
    {
        $data = $request->validate([
            'min_score' => ['required', 'integer', 'min:0'],
            'max_score' => ['required', 'integer', 'min:0'],
            'grade_letter' => ['required', 'string'],
            'remark' => ['required', 'string'],
        ]);

        $scale = GradingScale::create($data);

        return response()->json($scale, 201);
    }

    public function updateGradingScale(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'min_score' => ['required', 'integer', 'min:0'],
            'max_score' => ['required', 'integer', 'min:0'],
            'grade_letter' => ['required', 'string'],
            'remark' => ['required', 'string'],
        ]);

        return response()->json($this->resultService->updateGradeScale($id, $data));
    }

    public function deleteGradingScale(int $id): JsonResponse
    {
        $scale = GradingScale::findOrFail($id);
        $scale->delete();

        return response()->json(['message' => 'Grading scale deleted']);
    }
}
