<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('student_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete()->index();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete()->index();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->text('answer');
            $table->unsignedInteger('marks_awarded')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'exam_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_answers');
    }
};
