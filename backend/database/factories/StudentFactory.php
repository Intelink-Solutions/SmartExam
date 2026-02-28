<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'class_id' => SchoolClass::factory(),
            'student_id' => 'STD-'.$this->faker->unique()->numberBetween(1000, 9999),
            'photo_path' => null,
            'status' => 'active',
        ];
    }
}
