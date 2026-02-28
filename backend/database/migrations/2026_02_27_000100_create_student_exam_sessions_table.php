<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('student_exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete()->index();
            $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete()->index();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->boolean('is_submitted')->default(false);
            $table->timestamps();
            $table->index(['student_id', 'exam_id', 'is_submitted']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_exam_sessions');
    }
};
