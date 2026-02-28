<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
            $table->unique(['name', 'academic_year_id']);
            $table->index(['academic_year_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('terms');
    }
};
