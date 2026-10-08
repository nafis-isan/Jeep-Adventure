<?php

use App\Http\Controllers\AdventureController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('dashboard'));
Route::get('/health', fn () => response()->json(['status' => 'ok']));
Route::get('/mobile/{path?}', [AdventureController::class, 'mobileApp'])
    ->where('path', '.*')
    ->name('mobile');
Route::get('/login', [AdventureController::class, 'showLogin'])->name('login');
Route::post('/login', [AdventureController::class, 'login'])->middleware('throttle:10,1')->name('login.store');
Route::post('/logout', [AdventureController::class, 'logout'])->middleware('auth')->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [AdventureController::class, 'dashboard'])->name('dashboard');

    Route::get('/teams', [AdventureController::class, 'teams'])->name('teams');
    Route::post('/teams', [AdventureController::class, 'storeTeam'])->name('teams.store');
    Route::patch('/teams/{team}/status', [AdventureController::class, 'updateTeam'])->middleware('role:facilitator')->name('teams.status');
    Route::delete('/teams/{team}', [AdventureController::class, 'deleteTeam'])->middleware('role:facilitator')->name('teams.destroy');

    Route::get('/routes', [AdventureController::class, 'routes'])->name('routes');
    Route::get('/routes/{route}', [AdventureController::class, 'routeDetail'])->name('routes.show');
    Route::post('/routes', [AdventureController::class, 'storeRoute'])->middleware('role:facilitator')->name('routes.store');
    Route::patch('/routes/{route}', [AdventureController::class, 'updateRoute'])->middleware('role:facilitator')->name('routes.update');
    Route::delete('/routes/{route}', [AdventureController::class, 'deleteRoute'])->middleware('role:facilitator')->name('routes.destroy');

    Route::get('/scoreboard', [AdventureController::class, 'leaderboard'])->name('scoreboard');
    Route::get('/experiences', [AdventureController::class, 'experiences'])->name('experiences');
    Route::post('/experiences', [AdventureController::class, 'storeExperience'])->middleware('throttle:10,1')->name('experiences.store');

    Route::post('/checkins', [AdventureController::class, 'storeCheckIn'])->middleware('role:facilitator')->name('checkins.store');
    Route::delete('/checkins', [AdventureController::class, 'deleteCheckIn'])->middleware('role:facilitator')->name('checkins.destroy');
    Route::post('/scores', [AdventureController::class, 'storeScore'])->middleware('role:facilitator')->name('scores.store');
});
