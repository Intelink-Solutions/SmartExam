<?php

namespace App\Services;

use App\Models\GradingScale;
use App\Models\Result;
use App\Models\Student;
use App\Models\StudentAnswer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ResultService
{
    public function generate(int $classId, int $termId): Collection
    {
        return DB::transaction(function () use ($classId, $termId) {
            $students = Student::with('answers.exam')
                ->where('class_id', $classId)
                ->where('status', 'active')
                ->get();

            $results = collect();

            foreach ($students as $student) {
                $answers = StudentAnswer::query()
                    ->where('student_id', $student->id)
                    ->whereHas('exam', fn ($q) => $q->where('term_id', $termId)->where('class_id', $classId))
                    ->get();

                $total = (int) $answers->sum(fn ($a) => (int) ($a->marks_awarded ?? 0));
                $average = $answers->count() > 0 ? round($total / $answers->count(), 2) : 0;
                $grade = $this->gradeFromScore($average);

                $result = Result::updateOrCreate(
                    ['student_id' => $student->id, 'class_id' => $classId, 'term_id' => $termId],
                    [
                        'total_marks' => $total,
                        'average' => $average,
                        'grade' => $grade,
                    ]
                );

                $results->push($result);
            }

            $ranked = $results->sortByDesc('total_marks')->values();
            $position = 0;
            $lastScore = null;

            foreach ($ranked as $index => $result) {
                if ($lastScore === null || $result->total_marks < $lastScore) {
                    $position = $index + 1;
                }

                $result->update(['position' => $position]);
                $lastScore = $result->total_marks;
            }

            return Result::with(['student.user', 'schoolClass', 'term'])
                ->where('class_id', $classId)
                ->where('term_id', $termId)
                ->orderBy('position')
                ->get();
        });
    }

    public function classResults(int $classId): Collection
    {
        return Result::with(['student.user', 'term'])
            ->where('class_id', $classId)
            ->orderByDesc('total_marks')
            ->get();
    }

    public function gradeFromScore(float $score): string
    {
        $scale = GradingScale::where('min_score', '<=', $score)
            ->where('max_score', '>=', $score)
            ->orderBy('min_score', 'desc')
            ->first();

        return $scale?->grade_letter ?? 'N/A';
    }

    public function updateGradeScale(int $scaleId, array $data): GradingScale
    {
        $scale = GradingScale::findOrFail($scaleId);
        $scale->update($data);

        return $scale->refresh();
    }
}
