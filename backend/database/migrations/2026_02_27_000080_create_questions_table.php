<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete()->index();
            $table->enum('type', ['mcq', 'true_false', 'essay'])->index();
            $table->text('question_text');
            $table->text('correct_answer')->nullable();
            $table->unsignedInteger('marks');
            $table->timestamps();
            $table->index(['subject_id', 'class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
