<?php

namespace App\Http\Controllers;

use App\Services\BackupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BackupController extends Controller
{
    public function __construct(private readonly BackupService $backupService)
    {
    }

    public function export(): JsonResponse
    {
        $path = $this->backupService->exportDatabase();

        return response()->json([
            'message' => 'Backup created',
            'path' => $path,
        ]);
    }

    public function restore(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:sqlite,db'],
        ]);

        $this->backupService->restoreDatabase($request->file('file'));

        return response()->json(['message' => 'Database restored successfully']);
    }
}
