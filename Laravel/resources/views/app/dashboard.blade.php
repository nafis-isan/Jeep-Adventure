@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<section class="hero">
    <div class="hero-copy">
        <span class="eyebrow">OFFROAD · TEAM BUILDING · MINI GAMES</span>
        <h1>Petualangan seru<br>dimulai di sini.</h1>
        <p>Jelajahi setiap pos, tantang kekompakan tim, dan kumpulkan cerita di sepanjang perjalanan.</p>
        <div class="button-row">
            <a class="button light" href="{{ route('routes') }}">Jelajahi rute <span>→</span></a>
            <a class="button outline-light" href="{{ route('scoreboard') }}">Lihat papan skor</a>
        </div>
    </div>
    <div class="hero-badge"><span>✦</span><b>ADVENTURE<br>AWAITS</b></div>
</section>

<section class="page-section">
    <div class="stat-grid">
        <article class="stat-card"><span class="stat-icon">♧</span><b>{{ $stats['teams'] }}</b><small>Tim peserta</small></article>
        <article class="stat-card"><span class="stat-icon">⌖</span><b>{{ $stats['routes'] }}</b><small>Titik petualangan</small></article>
        <article class="stat-card"><span class="stat-icon">✓</span><b>{{ $stats['scores'] }}</b><small>Game selesai</small></article>
        <article class="stat-card"><span class="stat-icon">♜</span><b>{{ number_format($stats['points']) }}</b><small>Total poin</small></article>
    </div>
</section>

<section class="page-section">
    <div class="section-heading"><div><span class="eyebrow">JALUR PETUALANGAN</span><h2>Route &amp; Games</h2></div><a class="text-link" href="{{ route('routes') }}">Semua rute →</a></div>
    <div class="route-grid">
        @forelse($routes as $route)
            <a class="route-card" href="{{ route('routes.show', $route) }}" style="--route-color: {{ $route->color }}">
                <span class="route-number">POS {{ str_pad($route->position, 2, '0', STR_PAD_LEFT) }}</span>
                <span class="route-symbol">✦</span>
                <h3>{{ $route->name }}</h3>
                <p>{{ $route->game_type }}</p>
                <div class="route-meta"><span>⌖ {{ $route->location }}</span><span>{{ $route->duration }} menit</span></div>
            </a>
        @empty
            <div class="empty-state">Rute petualangan belum tersedia.</div>
        @endforelse
    </div>
</section>

<section class="page-section">
    <div class="section-heading"><div><span class="eyebrow">PERFORMA TIM</span><h2>Papan skor terbaru</h2></div><a class="text-link" href="{{ route('scoreboard') }}">Lihat semua →</a></div>
    <div class="table-card">
        @forelse($teams->sortByDesc(fn ($team) => $team->scores->sum('points'))->take(5) as $team)
            <div class="list-row"><span class="team-avatar">{{ $team->initials }}</span><div class="list-copy"><b>{{ $team->name }}</b><small>{{ $team->scores->where('completed', true)->count() }} game selesai</small></div><strong class="points">{{ number_format($team->scores->sum('points')) }} <small>PTS</small></strong></div>
        @empty
            <div class="empty-state">Tim peserta belum terdaftar.</div>
        @endforelse
    </div>
</section>
@endsection
