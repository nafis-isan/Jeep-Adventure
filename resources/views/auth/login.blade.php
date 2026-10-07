@extends('layouts.app')

@section('title', 'Masuk')

@section('content')
<div class="login-page">
    <div class="login-card">
        <a href="{{ route('login') }}" class="brand login-brand">
            <img src="{{ asset('Assets/images/jeep-adventure-logo.jpeg') }}" alt="" class="brand-mark">
            <span>JEEP <b>ADVENTURE</b></span>
        </a>
        <span class="eyebrow">OFFROAD · TEAM BUILDING · MINI GAMES</span>
        <h1>Welcome back</h1>
        <p class="muted">Masuk untuk melanjutkan petualanganmu.</p>
        @if($errors->any())
            <div class="flash error" role="alert">{{ $errors->first() }}</div>
        @endif
        <form method="post" action="{{ route('login.store') }}" class="form-stack">
            @csrf
            <label>Email
                <input type="email" name="email" value="{{ old('email') }}" autocomplete="username" placeholder="you@example.com" required autofocus>
            </label>
            <label>Password
                <input type="password" name="password" autocomplete="current-password" placeholder="Minimal 8 karakter" required>
            </label>
            <button class="button primary full" type="submit">Masuk ke akun <span>→</span></button>
        </form>
        <p class="login-foot">Petualangan dimulai dari sini.</p>
    </div>
</div>
@endsection
