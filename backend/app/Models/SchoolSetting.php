<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_name',
        'address',
        'contact',
        'class_score_weight',
        'exam_score_weight',
        'current_academic_year',
        'current_term',
        'logo_path',
        'image_path',
    ];
}
