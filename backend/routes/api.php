<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TermController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('students', StudentController::class)->middleware('check.role:super_admin,admin');
    Route::post('students/{student}/promote', [StudentController::class, 'promote'])->middleware('check.role:super_admin,admin');
    Route::patch('students/{student}/deactivate', [StudentController::class, 'deactivate'])->middleware('check.role:super_admin,admin');
    Route::post('students/import', [StudentController::class, 'bulkImport'])->middleware('check.role:super_admin,admin');

    Route::apiResource('teachers', TeacherController::class)->middleware('check.role:super_admin,admin');
    Route::apiResource('classes', ClassController::class)->middleware('check.role:super_admin,admin');
    Route::get('terms', [TermController::class, 'index'])->middleware('check.role:super_admin,admin,teacher');
    Route::apiResource('subjects', SubjectController::class)->middleware('check.role:super_admin,admin,teacher');

    Route::apiResource('questions', QuestionController::class)->middleware('check.role:super_admin,admin,teacher');
    Route::post('questions/import', [QuestionController::class, 'bulkImport'])->middleware('check.role:super_admin,admin,teacher');

    Route::apiResource('exams', ExamController::class)->middleware('check.role:super_admin,admin,teacher');
    Route::post('exams/{exam}/questions', [ExamController::class, 'attachQuestions'])->middleware('check.role:super_admin,admin,teacher');
    Route::post('exams/start', [ExamController::class, 'start'])->middleware('check.role:student');
    Route::post('exams/{exam}/answers', [ExamController::class, 'saveAnswer'])->middleware('check.role:student');
    Route::post('exams/submit', [ExamController::class, 'submit'])->middleware('check.role:student');
    Route::get('exams/{exam}/essay-answers', [ExamController::class, 'essayAnswers'])->middleware('check.role:super_admin,admin,teacher');
    Route::patch('exams/essay/{studentAnswer}', [ExamController::class, 'markEssay'])->middleware('check.role:super_admin,admin,teacher');

    Route::post('results/generate', [ResultController::class, 'generate'])->middleware('check.role:super_admin,admin');
    Route::get('results/class/{id}', [ResultController::class, 'classResults'])->middleware('check.role:super_admin,admin,teacher');
    Route::get('grading-scales', [ResultController::class, 'gradingScales'])->middleware('check.role:super_admin,admin');
    Route::post('grading-scales', [ResultController::class, 'storeGradingScale'])->middleware('check.role:super_admin,admin');
    Route::patch('grading-scales/{id}', [ResultController::class, 'updateGradingScale'])->middleware('check.role:super_admin,admin');
    Route::delete('grading-scales/{id}', [ResultController::class, 'deleteGradingScale'])->middleware('check.role:super_admin,admin');

    Route::get('settings', [SettingsController::class, 'show'])->middleware('check.role:super_admin,admin');
    Route::put('settings', [SettingsController::class, 'update'])->middleware('check.role:super_admin,admin');
    Route::post('settings/logo', [SettingsController::class, 'uploadLogo'])->middleware('check.role:super_admin,admin');
    Route::post('settings/image', [SettingsController::class, 'uploadImage'])->middleware('check.role:super_admin,admin');

    Route::prefix('reports')->group(function () {
        Route::get('top-students', [ReportController::class, 'topStudents'])->middleware('check.role:super_admin,admin,teacher');
        Route::get('failed', [ReportController::class, 'failed'])->middleware('check.role:super_admin,admin,teacher');
        Route::get('performance', [ReportController::class, 'performance'])->middleware('check.role:super_admin,admin,teacher');
    });

    Route::prefix('backup')->middleware('check.role:super_admin')->group(function () {
        Route::post('export', [BackupController::class, 'export']);
        Route::post('restore', [BackupController::class, 'restore']);
    });
});
