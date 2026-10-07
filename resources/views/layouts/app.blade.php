<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Jeep Adventure') · Jeep Adventure</title>
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    @stack('head')
</head>
<body>
    @auth
        <div class="app-shell">
            <aside class="sidebar">
                <a href="{{ route('dashboard') }}" class="brand">
                    <img src="{{ asset('Assets/images/jeep-adventure-logo.jpeg') }}" alt="" class="brand-mark">
                    <span>JEEP <b>ADVENTURE</b></span>
                </a>
                <nav class="side-nav" aria-label="Navigasi utama">
                    <a href="{{ route('dashboard') }}" class="{{ request()->routeIs('dashboard') ? 'active' : '' }}">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 20 7-15 3.2 7 2.3-4 5.5 12H3Z"/><path d="m7 12 1.5 1.5L10 12"/></svg>
                        <span>Dashboard</span>
                    </a>
                    <a href="{{ route('routes') }}" class="{{ request()->routeIs('routes*') ? 'active' : '' }}">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></svg>
                        <span>Route &amp; Games</span>
                    </a>
                    <a href="{{ route('teams') }}" class="{{ request()->routeIs('teams*') ? 'active' : '' }}">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <span>Tim</span>
                    </a>
                    <a href="{{ route('scoreboard') }}" class="{{ request()->routeIs('scoreboard') ? 'active' : '' }}">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 21h8m-4-4v4m-7-18h14v4a7 7 0 0 1-14 0V3Z"/><path d="M5 5H3v2a5 5 0 0 0 4 4.9M19 5h2v2a5 5 0 0 1-4 4.9"/></svg>
                        <span>Papan Skor</span>
                    </a>
                    @unless(auth()->user()->isFacilitator())
                        <a href="{{ route('experiences') }}" class="{{ request()->routeIs('experiences*') ? 'active' : '' }}">
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
                            <span>Bagikan Pengalaman</span>
                        </a>
                    @endunless
                </nav>
                <div class="sidebar-user">
                    <div class="sidebar-profile">
                        <div class="avatar">{{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 1)) }}</div>
                        <div class="user-copy"><b>{{ auth()->user()->name }}</b><small>{{ auth()->user()->email }}</small></div>
                    </div>
                    <form method="post" action="{{ route('logout') }}" class="sidebar-logout-form">
                        @csrf
                        <button class="logout" type="submit">
                            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>
                            <span>Keluar</span>
                        </button>
                    </form>
                </div>
            </aside>
            <main class="main-content">
                <header class="mobile-header">
                    <a href="{{ route('dashboard') }}" class="brand"><img src="{{ asset('Assets/images/jeep-adventure-logo.jpeg') }}" alt="" class="brand-mark"><span>JEEP <b>ADVENTURE</b></span></a>
                    <form method="post" action="{{ route('logout') }}">@csrf<button class="mobile-logout" type="submit">Keluar</button></form>
                </header>
                @if(session('status'))
                    <div class="flash success" role="status">{{ session('status') }}</div>
                @endif
                @if($errors->any())
                    <div class="flash error" role="alert">
                        <b>Periksa kembali data yang dimasukkan.</b>
                        <ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
                    </div>
                @endif
                @yield('content')
            </main>
            <nav class="mobile-nav" aria-label="Navigasi utama">
                <a href="{{ route('dashboard') }}" class="{{ request()->routeIs('dashboard') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 20 7-15 3.2 7 2.3-4 5.5 12H3Z"/><path d="m7 12 1.5 1.5L10 12"/></svg>Beranda
                </a>
                <a href="{{ route('routes') }}" class="{{ request()->routeIs('routes*') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></svg>Rute
                </a>
                <a href="{{ route('teams') }}" class="{{ request()->routeIs('teams*') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>Tim
                </a>
                <a href="{{ route('scoreboard') }}" class="{{ request()->routeIs('scoreboard') ? 'active' : '' }}">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 21h8m-4-4v4m-7-18h14v4a7 7 0 0 1-14 0V3Z"/><path d="M5 5H3v2a5 5 0 0 0 4 4.9M19 5h2v2a5 5 0 0 1-4 4.9"/></svg>Skor
                </a>
                @unless(auth()->user()->isFacilitator())
                    <a href="{{ route('experiences') }}" class="{{ request()->routeIs('experiences*') ? 'active' : '' }}">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>Cerita
                    </a>
                @endunless
            </nav>
        </div>
    @else
        @yield('content')
    @endauth
    @stack('scripts')
</body>
</html>
