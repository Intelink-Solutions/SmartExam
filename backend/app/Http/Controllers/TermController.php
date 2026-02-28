<?php

namespace App\Http\Controllers;

use App\Models\Term;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TermController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $terms = Term::with('academicYear')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 100));

        return response()->json($terms);
    }
}
