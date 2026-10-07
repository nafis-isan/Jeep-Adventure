<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckIn extends Model
{
    use HasUuids;

    protected $fillable = ['team_id', 'route_id'];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(AdventureRoute::class, 'route_id');
    }
}
