@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
@php
    $leader = $teams->sortByDesc(fn ($team) => $team->scores->sum('points'))->first();
    $leaderPoints = $leader?->scores->sum('points') ?? 0;
    $routeColors = ['#e56a00', '#2d67e8', '#1299b7', '#14a64b', '#9634e8', '#d69200'];
@endphp
<section class="dashboard-hero">
    <div class="dashboard-hero-content">
        <span class="dashboard-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg> OFFROAD · TEAM BUILDING · MINI GAMES</span>
        <h1>Petualangan Jeep<br>bukan sekadar keliling.</h1>
        <p>Rute offroad dengan titik-titik pemberhentian berisi mini games seru — ketepatan, puzzle, estafet, hingga treasure hunt. Jeep + team building dalam satu petualangan.</p>
        <div class="button-row">
            <a class="button dashboard-primary" href="{{ route('routes') }}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></svg> Lihat Rute &amp; Games</a>
            <a class="button dashboard-secondary" href="{{ route('scoreboard') }}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8m-4-4v4m-7-18h14v4a7 7 0 0 1-14 0V3Z"/><path d="M5 5H3v2a5 5 0 0 0 4 4.9M19 5h2v2a5 5 0 0 1-4 4.9"/></svg> Papan Skor</a>
        </div>
    </div>
</section>

<section class="dashboard-stats" aria-label="Statistik petualangan">
    <article class="dashboard-stat"><span class="dashboard-stat-icon stat-green" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 21V4"/><path d="M5 5c5-4 9 4 14 0v11c-5 4-9-4-14 0"/></svg></span><b>{{ $stats['routes'] }}</b><small>Titik Pemberhentian</small></article>
    <article class="dashboard-stat"><span class="dashboard-stat-icon stat-orange" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><b>{{ $stats['teams'] }}</b><small>Tim Peserta</small></article>
    <article class="dashboard-stat"><span class="dashboard-stat-icon stat-blue" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 8h12a3 3 0 0 1 2.9 2.2l1 4A3 3 0 0 1 19 18h-1l-2-2H8l-2 2H5a3 3 0 0 1-2.9-3.8l1-4A3 3 0 0 1 6 8Z"/><path d="M7 11v4m-2-2h4m7-1h.01M18 14h.01"/></svg></span><b>{{ $stats['scores'] }}</b><small>Game Selesai</small></article>
    <article class="dashboard-stat"><span class="dashboard-stat-icon stat-gold" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 21h8m-4-4v4m-7-18h14v4a7 7 0 0 1-14 0V3Z"/><path d="M5 5H3v2a5 5 0 0 0 4 4.9M19 5h2v2a5 5 0 0 1-4 4.9"/></svg></span><b>{{ number_format($leaderPoints) }}</b><small>Skor Tertinggi</small></article>
</section>

<section class="dashboard-routes">
    <div class="dashboard-section-heading">
        <div><h2>Rute Petualangan</h2><p>{{ $routes->count() }} titik pemberhentian, {{ $routes->count() }} mini games berbeda.</p></div>
        <a href="{{ route('routes') }}">Semua titik <span aria-hidden="true">→</span></a>
    </div>
    <div class="route-timeline">
        @forelse($routes as $index => $route)
            <a class="route-timeline-item" href="{{ route('routes.show', $route) }}">
                <span class="route-timeline-marker" style="--route-color: {{ $route->color ?: ($routeColors[$index % count($routeColors)]) }}">
                    @include('app.partials.route-icon', ['icon' => $route->icon])
                </span>
                @if($index < $routes->count() - 1)<span class="route-timeline-line" aria-hidden="true"></span>@endif
                <span class="route-timeline-copy">
                    <small>POS {{ $route->position }}</small>
                    <b>{{ $route->name }}</b>
                    <span>{{ $route->description }}</span>
                </span>
            </a>
        @empty
            <div class="empty-state">Rute petualangan belum tersedia.</div>
        @endforelse
    </div>
</section>

<section class="dashboard-leader">
    <span class="dashboard-leader-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 21h8m-4-4v4m-7-18h14v4a7 7 0 0 1-14 0V3Z"/><path d="M5 5H3v2a5 5 0 0 0 4 4.9M19 5h2v2a5 5 0 0 1-4 4.9"/></svg></span>
    <div class="dashboard-leader-copy">
        <small>PEMUNCAK SEMENTARA</small>
        <b>{{ $leader?->name ?? 'Belum ada tim' }}</b>
        <span>{{ $leader?->scores->where('completed', true)->count() ?? 0 }} game selesai · {{ number_format($leaderPoints) }} poin</span>
    </div>
    <a class="button dashboard-leader-button" href="{{ route('scoreboard') }}">Lihat Papan Skor <span aria-hidden="true">→</span></a>
</section>
@endsection
