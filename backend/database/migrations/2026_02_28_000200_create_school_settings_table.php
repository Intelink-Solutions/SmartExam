<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('school_name')->default('Smart Exam Pro School');
            $table->string('address')->nullable();
            $table->string('contact')->nullable();
            $table->unsignedTinyInteger('class_score_weight')->default(30);
            $table->unsignedTinyInteger('exam_score_weight')->default(70);
            $table->string('current_academic_year')->nullable();
            $table->string('current_term')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('image_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
