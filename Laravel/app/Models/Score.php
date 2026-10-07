<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Score extends Model
{
    use HasUuids;

    protected $fillable = [
        'team_id', 'route_id', 'points', 'completed', 'note', 'photo_path',
    ];

    protected function casts(): array
    {
        return ['completed' => 'boolean', 'points' => 'integer'];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(AdventureRoute::class, 'route_id');
    }
}
