<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete()->index();
            $table->foreignId('teacher_id')->constrained('teachers')->restrictOnDelete();
            $table->timestamps();
            $table->unique(['name', 'class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
