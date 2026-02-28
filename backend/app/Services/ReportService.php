<?php

namespace App\Services;

use App\Models\Result;
use App\Models\StudentAnswer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function topStudents(int $classId, int $limit = 10): Collection
    {
        return Result::with('student.user')
            ->where('class_id', $classId)
            ->orderByDesc('total_marks')
            ->limit($limit)
            ->get();
    }

    public function failedStudents(int $classId, float $passMark = 50): Collection
    {
        return Result::with('student.user')
            ->where('class_id', $classId)
            ->where('average', '<', $passMark)
            ->orderBy('average')
            ->get();
    }

    public function gradeDistribution(int $classId): Collection
    {
        return Result::select('grade', DB::raw('COUNT(*) as total'))
            ->where('class_id', $classId)
            ->groupBy('grade')
            ->orderBy('grade')
            ->get();
    }

    public function subjectPerformanceSummary(int $classId, int $termId): Collection
    {
        return StudentAnswer::query()
            ->join('exams', 'exams.id', '=', 'student_answers.exam_id')
            ->join('subjects', 'subjects.id', '=', 'exams.subject_id')
            ->where('exams.class_id', $classId)
            ->where('exams.term_id', $termId)
            ->groupBy('subjects.id', 'subjects.name')
            ->select('subjects.id', 'subjects.name', DB::raw('AVG(COALESCE(student_answers.marks_awarded,0)) as avg_score'))
            ->get();
    }

    public function classAveragePerSubject(int $classId, int $termId): Collection
    {
        return $this->subjectPerformanceSummary($classId, $termId);
    }
}
