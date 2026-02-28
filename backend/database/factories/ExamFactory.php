<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Term;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExamFactory extends Factory
{
    protected $model = Exam::class;

    public function definition(): array
    {
        return [
            'class_id' => SchoolClass::factory(),
            'subject_id' => Subject::factory(),
            'term_id' => Term::factory(),
            'duration_minutes' => 60,
            'total_marks' => 100,
            'status' => 'draft',
            'exam_date' => now()->addDays(7),
        ];
    }
}
