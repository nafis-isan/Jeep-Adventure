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
                    <a href="{{ route('dashboard') }}" class="{{ request()->routeIs('dashboard') ? 'active' : '' }}">▦ <span>Dashboard</span></a>
                    <a href="{{ route('routes') }}" class="{{ request()->routeIs('routes*') ? 'active' : '' }}">⌖ <span>Route &amp; Games</span></a>
                    <a href="{{ route('teams') }}" class="{{ request()->routeIs('teams*') ? 'active' : '' }}">♧ <span>Tim</span></a>
                    <a href="{{ route('scoreboard') }}" class="{{ request()->routeIs('scoreboard') ? 'active' : '' }}">♜ <span>Papan Skor</span></a>
                    @unless(auth()->user()->isFacilitator())
                        <a href="{{ route('experiences') }}" class="{{ request()->routeIs('experiences*') ? 'active' : '' }}">↗ <span>Bagikan Pengalaman</span></a>
                    @endunless
                </nav>
                <div class="sidebar-user">
                    <div class="avatar">{{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 2)) }}</div>
                    <div class="user-copy"><b>{{ auth()->user()->name }}</b><small>{{ auth()->user()->email }}</small></div>
                    <form method="post" action="{{ route('logout') }}">@csrf<button class="logout" type="submit" aria-label="Keluar">↗</button></form>
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
                <a href="{{ route('dashboard') }}" class="{{ request()->routeIs('dashboard') ? 'active' : '' }}"><span>▦</span>Beranda</a>
                <a href="{{ route('routes') }}" class="{{ request()->routeIs('routes*') ? 'active' : '' }}"><span>⌖</span>Rute</a>
                <a href="{{ route('teams') }}" class="{{ request()->routeIs('teams*') ? 'active' : '' }}"><span>♧</span>Tim</a>
                <a href="{{ route('scoreboard') }}" class="{{ request()->routeIs('scoreboard') ? 'active' : '' }}"><span>♜</span>Skor</a>
                @unless(auth()->user()->isFacilitator())
                    <a href="{{ route('experiences') }}" class="{{ request()->routeIs('experiences*') ? 'active' : '' }}"><span>↗</span>Cerita</a>
                @endunless
            </nav>
        </div>
    @else
        @yield('content')
    @endauth
    @stack('scripts')
</body>
</html>
