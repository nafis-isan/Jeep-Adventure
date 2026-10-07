<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'initials', 'motto', 'status'];

    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class);
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class);
    }
}
