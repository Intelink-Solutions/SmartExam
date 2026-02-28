<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('grading_scales', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('min_score');
            $table->unsignedInteger('max_score');
            $table->string('grade_letter');
            $table->string('remark');
            $table->timestamps();
            $table->unique(['min_score', 'max_score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grading_scales');
    }
};
