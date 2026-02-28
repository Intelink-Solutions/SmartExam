<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['mcq', 'true_false', 'essay']);

        return [
            'subject_id' => Subject::factory(),
            'class_id' => SchoolClass::factory(),
            'type' => $type,
            'question_text' => $this->faker->sentence(12),
            'correct_answer' => $type === 'essay' ? null : $this->faker->word(),
            'marks' => $this->faker->numberBetween(1, 10),
        ];
    }
}
