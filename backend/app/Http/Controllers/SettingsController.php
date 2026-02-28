<?php

namespace App\Http\Controllers;

use App\Models\SchoolSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = SchoolSetting::firstOrCreate([], [
            'school_name' => 'Smart Exam Pro School',
            'class_score_weight' => 30,
            'exam_score_weight' => 70,
        ]);

        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'school_name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'contact' => ['nullable', 'string', 'max:255'],
            'class_score_weight' => ['required', 'integer', 'min:0', 'max:100'],
            'exam_score_weight' => ['required', 'integer', 'min:0', 'max:100'],
            'current_academic_year' => ['nullable', 'string', 'max:100'],
            'current_term' => ['nullable', 'string', 'max:100'],
        ]);

        if (($data['class_score_weight'] + $data['exam_score_weight']) !== 100) {
            return response()->json([
                'message' => 'Class score and exam score percentages must add up to 100.',
            ], 422);
        }

        $settings = SchoolSetting::firstOrCreate([], [
            'school_name' => 'Smart Exam Pro School',
            'class_score_weight' => 30,
            'exam_score_weight' => 70,
        ]);

        $settings->update($data);

        return response()->json($settings->refresh());
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'max:3072'],
        ]);

        $settings = SchoolSetting::firstOrCreate([], [
            'school_name' => 'Smart Exam Pro School',
            'class_score_weight' => 30,
            'exam_score_weight' => 70,
        ]);

        $path = $request->file('logo')->store('settings/logos', 'public');
        $settings->update(['logo_path' => $path]);

        return response()->json([
            'message' => 'Logo uploaded successfully',
            'logo_path' => $path,
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:4096'],
        ]);

        $settings = SchoolSetting::firstOrCreate([], [
            'school_name' => 'Smart Exam Pro School',
            'class_score_weight' => 30,
            'exam_score_weight' => 70,
        ]);

        $path = $request->file('image')->store('settings/images', 'public');
        $settings->update(['image_path' => $path]);

        return response()->json([
            'message' => 'School image uploaded successfully',
            'image_path' => $path,
        ]);
    }
}
