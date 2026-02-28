<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class BackupService
{
    public function exportDatabase(): string
    {
        $dbPath = database_path('database.sqlite');

        if (! file_exists($dbPath)) {
            throw ValidationException::withMessages(['database' => 'SQLite database not found.']);
        }

        $timestamp = now()->format('Ymd_His');
        $backupPath = "backups/database_{$timestamp}.sqlite";
        Storage::disk('local')->put($backupPath, file_get_contents($dbPath));

        return $backupPath;
    }

    public function restoreDatabase(UploadedFile $file): void
    {
        if (! in_array($file->getClientOriginalExtension(), ['sqlite', 'db'], true)) {
            throw ValidationException::withMessages(['file' => 'Invalid backup file type.']);
        }

        $contents = file_get_contents($file->getRealPath());
        if ($contents === false || strlen($contents) < 100) {
            throw ValidationException::withMessages(['file' => 'Invalid or corrupted backup file.']);
        }

        file_put_contents(database_path('database.sqlite'), $contents);
    }
}
