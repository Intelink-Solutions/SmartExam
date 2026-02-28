<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use App\Models\Term;
use Illuminate\Database\Eloquent\Factories\Factory;

class TermFactory extends Factory
{
    protected $model = Term::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['First Term', 'Second Term', 'Third Term']),
            'academic_year_id' => AcademicYear::factory(),
            'is_active' => false,
        ];
    }
}
