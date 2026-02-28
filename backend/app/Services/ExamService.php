<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Result;
use App\Models\Student;
use App\Models\StudentAnswer;
use App\Models\StudentExamSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ExamService
{
    public function createExam(array $data): Exam
    {
        return Exam::create($data);
    }

    public function attachQuestions(Exam $exam, array $questionIds): Exam
    {
        if ($exam->status === 'active') {
            throw ValidationException::withMessages(['exam' => 'Cannot edit an active exam.']);
        }

        $exam->questions()->sync($questionIds);

        return $exam->load('questions');
    }

    public function startExam(Student $student, Exam $exam): StudentExamSession
    {
        if ($exam->status !== 'active') {
            throw ValidationException::withMessages(['exam' => 'Exam is not active.']);
        }

        if ((int) $student->class_id !== (int) $exam->class_id) {
            throw ValidationException::withMessages(['student' => 'Student class mismatch.']);
        }

        $alreadySubmitted = StudentExamSession::where('student_id', $student->id)
            ->where('exam_id', $exam->id)
            ->where('is_submitted', true)
            ->exists();

        if ($alreadySubmitted) {
            throw ValidationException::withMessages(['exam' => 'Exam already submitted.']);
        }

        $activeSession = StudentExamSession::where('student_id', $student->id)
            ->where('exam_id', $exam->id)
            ->where('is_submitted', false)
            ->where('end_time', '>', now())
            ->first();

        if ($activeSession) {
            return $activeSession;
        }

        return StudentExamSession::create([
            'student_id' => $student->id,
            'exam_id' => $exam->id,
            'start_time' => now(),
            'end_time' => now()->addMinutes($exam->duration_minutes),
            'is_submitted' => false,
        ]);
    }

    public function saveAnswer(Student $student, Exam $exam, int $questionId, string $answer): StudentAnswer
    {
        $session = StudentExamSession::where('student_id', $student->id)
            ->where('exam_id', $exam->id)
            ->where('is_submitted', false)
            ->latest('id')
            ->first();

        if (! $session) {
            throw ValidationException::withMessages(['exam' => 'No active session found.']);
        }

        if (Carbon::now()->greaterThan($session->end_time)) {
            $this->submitExam($student, $exam);
            throw ValidationException::withMessages(['exam' => 'Session expired. Exam auto-submitted.']);
        }

        return StudentAnswer::updateOrCreate(
            [
                'student_id' => $student->id,
                'exam_id' => $exam->id,
                'question_id' => $questionId,
            ],
            [
                'answer' => $answer,
            ]
        );
    }

    public function submitExam(Student $student, Exam $exam): array
    {
        return DB::transaction(function () use ($student, $exam) {
            $session = StudentExamSession::where('student_id', $student->id)
                ->where('exam_id', $exam->id)
                ->where('is_submitted', false)
                ->latest('id')
                ->first();

            if (! $session) {
                throw ValidationException::withMessages(['exam' => 'No active session found.']);
            }

            $questions = $exam->questions()->get();
            $answers = StudentAnswer::where('student_id', $student->id)
                ->where('exam_id', $exam->id)
                ->get()
                ->keyBy('question_id');

            $objectiveTotal = 0;
            $essayPending = false;

            foreach ($questions as $question) {
                $answer = $answers->get($question->id);

                if (! $answer) {
                    continue;
                }

                if (in_array($question->type, ['mcq', 'true_false'], true)) {
                    $isCorrect = mb_strtolower(trim((string) $answer->answer)) === mb_strtolower(trim((string) $question->correct_answer));
                    $marks = $isCorrect ? $question->marks : 0;
                    $answer->update(['marks_awarded' => $marks]);
                    $objectiveTotal += $marks;
                } else {
                    $answer->update(['marks_awarded' => null]);
                    $essayPending = true;
                }
            }

            Result::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'class_id' => $student->class_id,
                    'term_id' => $exam->term_id,
                ],
                [
                    'total_marks' => $objectiveTotal,
                    'average' => $exam->total_marks > 0 ? round(($objectiveTotal / $exam->total_marks) * 100, 2) : 0,
                    'position' => null,
                    'grade' => $essayPending ? 'PENDING' : 'GRADED',
                ]
            );

            $session->update(['is_submitted' => true]);

            return [
                'session' => $session->refresh(),
                'objective_total' => $objectiveTotal,
                'essay_pending' => $essayPending,
            ];
        });
    }

    public function markEssay(StudentAnswer $answer, int $marks): StudentAnswer
    {
        $answer->update(['marks_awarded' => $marks]);

        return $answer->refresh();
    }
}
