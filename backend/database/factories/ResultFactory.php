<?php

namespace Database\Factories;

use App\Models\Result;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Term;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResultFactory extends Factory
{
    protected $model = Result::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'class_id' => SchoolClass::factory(),
            'term_id' => Term::factory(),
            'total_marks' => $this->faker->numberBetween(20, 100),
            'average' => $this->faker->randomFloat(2, 20, 100),
            'position' => $this->faker->numberBetween(1, 50),
            'grade' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'F']),
        ];
    }
}
