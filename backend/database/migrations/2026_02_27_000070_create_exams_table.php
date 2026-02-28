<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete()->index();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('term_id')->constrained('terms')->cascadeOnDelete()->index();
            $table->unsignedInteger('duration_minutes');
            $table->unsignedInteger('total_marks');
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft')->index();
            $table->dateTime('exam_date');
            $table->timestamps();
            $table->unique(['class_id', 'subject_id', 'term_id'], 'exam_uniqueness_per_term');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
