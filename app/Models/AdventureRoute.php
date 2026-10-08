<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdventureRoute extends Model
{
    use HasUuids;

    public const ICONS = [
        'target' => 'Target',
        'puzzle' => 'Puzzle',
        'water' => 'Water',
        'team' => 'Team',
        'camera' => 'Camera',
        'compass' => 'Compass',
    ];

    protected $table = 'routes';

    protected $fillable = [
        'position', 'name', 'game_type', 'description', 'instruction',
        'location', 'duration', 'max_points', 'difficulty', 'color', 'icon',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'duration' => 'integer',
            'max_points' => 'integer',
        ];
    }

    public static function iconForPosition(int $position): string
    {
        return match ($position) {
            1 => 'target',
            2 => 'puzzle',
            3 => 'water',
            4 => 'team',
            5 => 'camera',
            default => 'compass',
        };
    }

    public function getIconAttribute(?string $value): string
    {
        return $value ?? self::iconForPosition((int) $this->position);
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
