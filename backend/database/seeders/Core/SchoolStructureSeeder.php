<?php

namespace Database\Seeders\Core;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Term;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SchoolStructureSeeder extends Seeder
{
    public function run(): void
    {
        $class = SchoolClass::firstOrCreate(['name' => 'Grade 10']);

        $teacher = Teacher::firstOrCreate([
            'user_id' => User::where('email', 'teacher@smartexampro.local')->value('id'),
        ]);

        Subject::firstOrCreate([
            'name' => 'Mathematics',
            'class_id' => $class->id,
            'teacher_id' => $teacher->id,
        ]);

        $year = AcademicYear::firstOrCreate(['name' => '2025/2026'], ['is_active' => true]);
        Term::firstOrCreate(['name' => 'First Term', 'academic_year_id' => $year->id], ['is_active' => true]);

        $studentUser = User::where('email', 'student@smartexampro.local')->first();

        if ($studentUser) {
            Student::firstOrCreate(
                ['user_id' => $studentUser->id],
                [
                    'class_id' => $class->id,
                    'student_id' => 'STD-0001',
                    'status' => 'active',
                ]
            );
        }

        if (! User::where('email', 'student2@smartexampro.local')->exists()) {
            $extraStudent = User::create([
                'name' => 'Student Two',
                'email' => 'student2@smartexampro.local',
                'password' => Hash::make('password123'),
                'role' => 'student',
            ]);

            Student::create([
                'user_id' => $extraStudent->id,
                'class_id' => $class->id,
                'student_id' => 'STD-0002',
                'status' => 'active',
            ]);
        }
    }
}
