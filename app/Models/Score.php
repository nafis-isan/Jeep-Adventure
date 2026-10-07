<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Score extends Model
{
    use HasUuids;

    protected $fillable = [
        'team_id', 'route_id', 'points', 'completed', 'note', 'photo_path',
    ];

    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return ['completed' => 'boolean', 'points' => 'integer'];
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null;
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
