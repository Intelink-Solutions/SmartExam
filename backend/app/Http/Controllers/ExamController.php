<?php

namespace App\Http\Controllers;

use App\Http\Requests\Exam\AttachQuestionsRequest;
use App\Http\Requests\Exam\SaveAnswerRequest;
use App\Http\Requests\Exam\StartExamRequest;
use App\Http\Requests\Exam\StoreExamRequest;
use App\Http\Requests\Exam\SubmitExamRequest;
use App\Models\Exam;
use App\Models\StudentAnswer;
use App\Services\ExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExamController extends Controller
{
    public function __construct(private readonly ExamService $examService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $exams = Exam::with(['schoolClass', 'subject', 'term', 'questions'])
            ->paginate($request->integer('per_page', 20));

        return response()->json($exams);
    }

    public function store(StoreExamRequest $request): JsonResponse
    {
        $exam = $this->examService->createExam($request->validated());

        return response()->json($exam, 201);
    }

    public function show(Exam $exam): JsonResponse
    {
        return response()->json($exam->load(['schoolClass', 'subject', 'term', 'questions']));
    }

    public function update(Request $request, Exam $exam): JsonResponse
    {
        if ($exam->status === 'active') {
            return response()->json(['message' => 'Cannot edit an active exam.'], 422);
        }

        $data = $request->validate([
            'class_id' => ['sometimes', 'exists:classes,id'],
            'subject_id' => ['sometimes', 'exists:subjects,id'],
            'term_id' => ['sometimes', 'exists:terms,id'],
            'duration_minutes' => ['sometimes', 'integer', 'min:1'],
            'total_marks' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', Rule::in(['draft', 'active', 'closed'])],
            'exam_date' => ['sometimes', 'date'],
        ]);

        $exam->update($data);

        return response()->json($exam->refresh()->load(['schoolClass', 'subject', 'term', 'questions']));
    }

    public function destroy(Exam $exam): JsonResponse
    {
        if ($exam->status === 'active') {
            return response()->json(['message' => 'Cannot delete an active exam.'], 422);
        }

        $exam->delete();

        return response()->json(['message' => 'Exam deleted']);
    }

    public function attachQuestions(AttachQuestionsRequest $request, Exam $exam): JsonResponse
    {
        $updated = $this->examService->attachQuestions($exam, $request->validated('question_ids'));

        return response()->json($updated);
    }

    public function start(StartExamRequest $request): JsonResponse
    {
        $student = $request->user()->student;
        if (! $student) {
            return response()->json(['message' => 'Student profile not found'], 403);
        }
        $exam = Exam::with('questions')->findOrFail($request->validated('exam_id'));

        $session = $this->examService->startExam($student, $exam);

        return response()->json([
            'session' => $session,
            'exam' => $exam,
        ]);
    }

    public function saveAnswer(SaveAnswerRequest $request, Exam $exam): JsonResponse
    {
        $student = $request->user()->student;
        if (! $student) {
            return response()->json(['message' => 'Student profile not found'], 403);
        }

        $answer = $this->examService->saveAnswer(
            $student,
            $exam,
            (int) $request->validated('question_id'),
            $request->validated('answer')
        );

        return response()->json($answer);
    }

    public function submit(SubmitExamRequest $request): JsonResponse
    {
        $student = $request->user()->student;
        if (! $student) {
            return response()->json(['message' => 'Student profile not found'], 403);
        }
        $exam = Exam::findOrFail($request->validated('exam_id'));

        $result = $this->examService->submitExam($student, $exam);

        return response()->json($result);
    }

    public function markEssay(Request $request, StudentAnswer $studentAnswer): JsonResponse
    {
        $data = $request->validate(['marks' => ['required', 'integer', 'min:0']]);

        $answer = $this->examService->markEssay($studentAnswer, $data['marks']);

        return response()->json($answer);
    }

    public function essayAnswers(Exam $exam): JsonResponse
    {
        $answers = StudentAnswer::with(['student.user', 'question'])
            ->where('exam_id', $exam->id)
            ->whereHas('question', fn ($q) => $q->where('type', 'essay'))
            ->whereNull('marks_awarded')
            ->get();

        return response()->json($answers);
    }
}
