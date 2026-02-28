<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete()->index();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete()->index();
            $table->foreignId('term_id')->constrained('terms')->cascadeOnDelete()->index();
            $table->unsignedInteger('total_marks');
            $table->decimal('average', 8, 2);
            $table->unsignedInteger('position')->nullable();
            $table->string('grade');
            $table->timestamps();
            $table->unique(['student_id', 'class_id', 'term_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
