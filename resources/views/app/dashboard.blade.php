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
        <span class="dashboard-badge"><span aria-hidden="true">✧</span> OFFROAD · TEAM BUILDING · MINI GAMES</span>
        <h1>Petualangan Jeep<br>bukan sekadar keliling.</h1>
        <p>Rute offroad dengan titik-titik pemberhentian berisi mini games seru — ketepatan, puzzle, estafet, hingga treasure hunt. Jeep + team building dalam satu petualangan.</p>
        <div class="button-row">
            <a class="button dashboard-primary" href="{{ route('routes') }}"><span aria-hidden="true">♧</span> Lihat Rute &amp; Games</a>
            <a class="button dashboard-secondary" href="{{ route('scoreboard') }}"><span aria-hidden="true">♜</span> Papan Skor</a>
        </div>
    </div>
</section>

<section class="dashboard-stats" aria-label="Statistik petualangan">
    <article class="dashboard-stat"><span class="dashboard-stat-icon stat-green" aria-hidden="true">⚑</span><b>{{ $stats['routes'] }}</b><small>Titik Pemberhentian</small></article>
    <article class="dashboard-stat"><span class="dashboard-stat-icon stat-orange" aria-hidden="true">♧</span><b>{{ $stats['teams'] }}</b><small>Tim Peserta</small></article>
    <article class="dashboard-stat"><span class="dashboard-stat-icon stat-blue" aria-hidden="true">⚿</span><b>{{ $stats['scores'] }}</b><small>Game Selesai</small></article>
    <article class="dashboard-stat"><span class="dashboard-stat-icon stat-gold" aria-hidden="true">♜</span><b>{{ number_format($leaderPoints) }}</b><small>Skor Tertinggi</small></article>
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
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        @switch($route->position)
                            @case(1)
                                <circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>
                                @break
                            @case(2)
                                <path d="M8 4.5a2.5 2.5 0 1 1 4.6 1.3H18a2 2 0 0 1 2 2v3.4a2.5 2.5 0 1 0 0 5V19a2 2 0 0 1-2 2h-3.5a2.5 2.5 0 1 0-5 0H6a2 2 0 0 1-2-2v-3.4a2.5 2.5 0 1 0 0-5V7a2 2 0 0 1 2-2h3.3A2.5 2.5 0 0 1 8 4.5Z"/>
                                @break
                            @case(3)
                                <path d="M8 3.5S4.5 8 4.5 11a3.5 3.5 0 0 0 7 0C11.5 8 8 3.5 8 3.5Z"/><path d="M16.5 7s-3 3.8-3 6.5a3 3 0 0 0 6 0c0-2.7-3-6.5-3-6.5Z"/>
                                @break
                            @case(4)
                                <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M16.5 10a2.5 2.5 0 1 0 0-5"/><path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19Z"/><path d="M16 13a4 4 0 0 1 4 4v2h-3"/>
                                @break
                            @case(5)
                                <path d="M8.5 6 10 4h4l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12.5" r="3.5"/>
                                @break
                            @default
                                <circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4Z"/>
                        @endswitch
                    </svg>
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
    <span class="dashboard-leader-icon" aria-hidden="true">♜</span>
    <div class="dashboard-leader-copy">
        <small>PEMUNCAK SEMENTARA</small>
        <b>{{ $leader?->name ?? 'Belum ada tim' }}</b>
        <span>{{ $leader?->scores->where('completed', true)->count() ?? 0 }} game selesai · {{ number_format($leaderPoints) }} poin</span>
    </div>
    <a class="button dashboard-leader-button" href="{{ route('scoreboard') }}">Lihat Papan Skor <span aria-hidden="true">→</span></a>
</section>
@endsection
