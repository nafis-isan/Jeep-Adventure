<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Experience extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'team_id', 'route_id', 'story', 'rating', 'media_path', 'media_type',
    ];

    protected $appends = ['media_url'];

    protected function casts(): array
    {
        return ['rating' => 'integer'];
    }

    public function getMediaUrlAttribute(): ?string
    {
        return $this->media_path ? Storage::disk('public')->url($this->media_path) : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
