<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicYearFactory extends Factory
{
    protected $model = AcademicYear::class;

    public function definition(): array
    {
        $year = $this->faker->numberBetween(2024, 2030);

        return [
            'name' => $year.'/'.($year + 1),
            'is_active' => false,
        ];
    }
}
