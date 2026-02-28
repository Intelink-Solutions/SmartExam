<?php

namespace App\Services;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StudentService
{
    public function create(array $data, ?UploadedFile $photo = null): Student
    {
        return DB::transaction(function () use ($data, $photo) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'student',
            ]);

            $photoPath = $photo ? $photo->store('students/photos', 'public') : null;

            return Student::create([
                'user_id' => $user->id,
                'class_id' => $data['class_id'],
                'student_id' => $data['student_id'],
                'photo_path' => $photoPath,
                'status' => $data['status'] ?? 'active',
            ]);
        });
    }

    public function update(Student $student, array $data, ?UploadedFile $photo = null): Student
    {
        return DB::transaction(function () use ($student, $data, $photo) {
            $student->user->update([
                'name' => $data['name'] ?? $student->user->name,
                'email' => $data['email'] ?? $student->user->email,
            ]);

            $payload = [
                'class_id' => $data['class_id'] ?? $student->class_id,
                'student_id' => $data['student_id'] ?? $student->student_id,
                'status' => $data['status'] ?? $student->status,
            ];

            if ($photo) {
                $payload['photo_path'] = $photo->store('students/photos', 'public');
            }

            $student->update($payload);

            return $student->refresh();
        });
    }

    public function promote(Student $student, int $classId): Student
    {
        $student->update(['class_id' => $classId]);

        return $student->refresh();
    }

    public function deactivate(Student $student): Student
    {
        $student->update(['status' => 'inactive']);

        return $student->refresh();
    }

    public function delete(Student $student): void
    {
        DB::transaction(function () use ($student) {
            $user = $student->user;
            $student->delete();
            $user->delete();
        });
    }

    public function bulkImport(string $csvPath): array
    {
        $rows = array_map('str_getcsv', file($csvPath));

        $imported = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            if ($index === 0) {
                continue;
            }

            try {
                if (count($row) < 5) {
                    throw new \RuntimeException('Invalid column count');
                }

                [$name, $email, $classId, $studentId, $password] = $row;

                $this->create([
                    'name' => trim($name),
                    'email' => trim($email),
                    'class_id' => (int) trim($classId),
                    'student_id' => trim($studentId) ?: Str::uuid()->toString(),
                    'password' => trim($password) ?: 'password123',
                    'status' => 'active',
                ]);

                $imported++;
            } catch (\Throwable $exception) {
                $errors[] = [
                    'row' => $index + 1,
                    'message' => $exception->getMessage(),
                ];
            }
        }

        return compact('imported', 'errors');
    }
}
