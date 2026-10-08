@extends('layouts.app')

@section('title', 'Masuk')

@section('content')
<div class="login-page">
    <div class="login-card">
        <a href="{{ route('login') }}" class="login-brand">
            <img src="{{ asset('Assets/images/jeep-adventure-logo.jpeg') }}" alt="" class="login-brand-mark">
            <span><b>Jeep Adventure</b><small>OFFROAD TEAM<br>BUILDING</small></span>
        </a>
        <h1>Welcome back</h1>
        <p class="login-subtitle">Log in to your account</p>
        @if($errors->any())
            <div class="flash error" role="alert">{{ $errors->first() }}</div>
        @endif
        <form method="post" action="{{ route('login.store') }}" class="login-form">
            @csrf
            <label>Email
                <input type="email" name="email" value="{{ old('email') }}" autocomplete="username" placeholder="user@example.com" required autofocus>
            </label>
            <div class="login-password-field">
                <div class="login-password-label">
                    <label for="password">Password</label>
                    <span class="login-forgot-password">Forgot password?</span>
                </div>
                <input id="password" type="password" name="password" autocomplete="current-password" placeholder="••••••••" required>
            </div>
            <button class="button primary full" type="submit">Log in</button>
        </form>
    </div>
</div>
@endsection
