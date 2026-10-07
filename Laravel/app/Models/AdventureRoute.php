<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdventureRoute extends Model
{
    use HasUuids;

    protected $table = 'routes';

    protected $fillable = [
        'position', 'name', 'game_type', 'description', 'instruction',
        'location', 'duration', 'max_points', 'difficulty', 'color',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'duration' => 'integer',
            'max_points' => 'integer',
        ];
    }

    public function scores(): HasMany
    {
        return $this->hasMany(Score::class, 'route_id');
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class, 'route_id');
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class, 'route_id');
    }
}
