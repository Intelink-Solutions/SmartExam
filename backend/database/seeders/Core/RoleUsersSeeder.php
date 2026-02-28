<?php

namespace Database\Seeders\Core;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleUsersSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@smartexampro.local'],
            ['name' => 'Super Admin', 'password' => Hash::make('password123'), 'role' => 'super_admin']
        );

        User::updateOrCreate(
            ['email' => 'admin@smartexampro.local'],
            ['name' => 'Admin User', 'password' => Hash::make('password123'), 'role' => 'admin']
        );

        $teacherUser = User::updateOrCreate(
            ['email' => 'teacher@smartexampro.local'],
            ['name' => 'Teacher User', 'password' => Hash::make('password123'), 'role' => 'teacher']
        );

        Teacher::firstOrCreate(['user_id' => $teacherUser->id]);

        User::updateOrCreate(
            ['email' => 'student@smartexampro.local'],
            ['name' => 'Student User', 'password' => Hash::make('password123'), 'role' => 'student']
        );
    }
}
