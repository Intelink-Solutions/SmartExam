<?php

namespace Database\Seeders\Core;

use App\Models\GradingScale;
use Illuminate\Database\Seeder;

class GradingScaleSeeder extends Seeder
{
    public function run(): void
    {
        $scales = [
            ['min_score' => 80, 'max_score' => 100, 'grade_letter' => 'A', 'remark' => 'Excellent'],
            ['min_score' => 70, 'max_score' => 79, 'grade_letter' => 'B', 'remark' => 'Very Good'],
            ['min_score' => 60, 'max_score' => 69, 'grade_letter' => 'C', 'remark' => 'Good'],
            ['min_score' => 50, 'max_score' => 59, 'grade_letter' => 'D', 'remark' => 'Pass'],
            ['min_score' => 0, 'max_score' => 49, 'grade_letter' => 'F', 'remark' => 'Fail'],
        ];

        foreach ($scales as $scale) {
            GradingScale::updateOrCreate(
                ['min_score' => $scale['min_score'], 'max_score' => $scale['max_score']],
                $scale
            );
        }
    }
}
