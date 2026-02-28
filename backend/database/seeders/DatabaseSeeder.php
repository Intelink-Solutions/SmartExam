<?php

namespace Database\Seeders;

use Database\Seeders\Core\GradingScaleSeeder;
use Database\Seeders\Core\RoleUsersSeeder;
use Database\Seeders\Core\SchoolStructureSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleUsersSeeder::class,
            SchoolStructureSeeder::class,
            GradingScaleSeeder::class,
        ]);
    }
}
