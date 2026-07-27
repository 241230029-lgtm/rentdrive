<?php

use App\Http\Controllers\Guest\LandingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'index'])
    ->name('landing_page');
