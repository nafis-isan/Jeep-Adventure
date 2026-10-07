<?php

use App\Http\Controllers\AdventureController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AdventureController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AdventureController::class, 'me']);
    Route::post('/auth/logout', [AdventureController::class, 'logout']);
    Route::post('/auth/accounts', [AdventureController::class, 'createAccount'])->middleware('role:facilitator');

    Route::get('/teams', [AdventureController::class, 'teams']);
    Route::post('/teams', [AdventureController::class, 'storeTeam']);
    Route::patch('/teams/{team}', [AdventureController::class, 'updateTeam'])->middleware('role:facilitator');
    Route::delete('/teams/{team}', [AdventureController::class, 'deleteTeam'])->middleware('role:facilitator');

    Route::get('/routes', [AdventureController::class, 'routes']);
    Route::get('/routes/{route}', [AdventureController::class, 'apiRoute']);
    Route::post('/routes', [AdventureController::class, 'storeRoute'])->middleware('role:facilitator');
    Route::patch('/routes/{route}', [AdventureController::class, 'updateRoute'])->middleware('role:facilitator');
    Route::delete('/routes/{route}', [AdventureController::class, 'deleteRoute'])->middleware('role:facilitator');

    Route::get('/checkins', [AdventureController::class, 'checkIns']);
    Route::post('/checkins', [AdventureController::class, 'storeCheckIn'])->middleware('role:facilitator');
    Route::delete('/checkins', [AdventureController::class, 'deleteCheckIn'])->middleware('role:facilitator');

    Route::get('/scores', [AdventureController::class, 'scores']);
    Route::post('/scores', [AdventureController::class, 'storeScore'])->middleware('role:facilitator');
    Route::get('/leaderboard', [AdventureController::class, 'leaderboard']);

    Route::get('/experiences', [AdventureController::class, 'experiences']);
    Route::post('/experiences', [AdventureController::class, 'storeExperience'])->middleware('throttle:10,1');
});
