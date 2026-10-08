@extends('layouts.app')

@section('title', 'Papan Skor')

@section('content')
@php
    $podiumRanks = [2, 1, 3];
@endphp
<section class="scoreboard-heading">
    <span class="scoreboard-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8m-4-4v4m-7-18h14v4a7 7 0 0 1-14 0V3Z"/><path d="M5 5H3v2a5 5 0 0 0 4 4.9M19 5h2v2a5 5 0 0 1-4 4.9"/></svg><span>PAPAN SKOR</span></span>
    <h1>Peringkat Tim</h1>
    <p>Peringkat sementara berdasarkan akumulasi skor mini games.</p>
</section>

@if($leaderboard->isNotEmpty())
    <section class="podium-stage" aria-label="Podium peringkat tim">
        @foreach($podiumRanks as $rank)
            @php
                $team = $leaderboard->get($rank - 1);
                $podiumClasses = [
                    1 => 'podium-first rank-first podium-rank-1',
                    2 => 'podium-second rank-second podium-rank-2',
                    3 => 'podium-third rank-third podium-rank-3',
                ];
                $progress = $team && $totalRoutes > 0 ? min(100, round($team['completedGames'] / $totalRoutes * 100)) : 0;
            @endphp
            <article class="podium-card {{ $podiumClasses[$rank] }} {{ $team ? 'has-team' : 'no-team' }}" style="--team-color: {{ $team['color'] ?? '#59746b' }}">
                <span class="team-avatar podium-avatar team-color-avatar">{{ $team['initials'] ?? '--' }}</span>
                @if($team)
                    <b class="podium-team-name">{{ $team['name'] }}</b>
                    <span class="podium-score">{{ number_format($team['totalPoints']) }} <small>poin</small></span>
                @else
                    <b class="podium-team-name">Belum ada tim</b>
                    <span class="podium-score">0 <small>poin</small></span>
                @endif
                <span class="podium-platform" aria-label="Peringkat {{ $rank }}"><b>{{ $rank }}</b></span>
            </article>
        @endforeach
    </section>
    <section class="scoreboard-rankings" aria-label="Peringkat tim">
        @foreach($leaderboard as $index => $team)
            @php
                $rank = $index + 1;
                $progress = $totalRoutes > 0 ? min(100, round($team['completedGames'] / $totalRoutes * 100)) : 0;
            @endphp
            <article class="scoreboard-ranking-row {{ $rank === 1 ? 'scoreboard-ranking-first' : '' }}" style="--team-color: {{ $team['color'] ?? '#59746b' }}">
                <span class="scoreboard-rank-badge scoreboard-rank-{{ $rank }}" aria-label="Peringkat {{ $rank }}">
                    @if($rank === 1)
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8m-4-4v4m-7-18h14v4a7 7 0 0 1-14 0V3Z"/><path d="M5 5H3v2a5 5 0 0 0 4 4.9M19 5h2v2a5 5 0 0 1-4 4.9"/></svg>
                    @else
                        {{ $rank }}
                    @endif
                </span>
                <span class="team-avatar scoreboard-ranking-avatar team-color-avatar">{{ $team['initials'] }}</span>
                <b class="scoreboard-ranking-name">{{ $team['name'] }}</b>
                <div class="scoreboard-ranking-progress">
                    <span class="leader-progress" role="progressbar" aria-label="Game selesai" aria-valuenow="{{ $team['completedGames'] }}" aria-valuemin="0" aria-valuemax="{{ max(1, $totalRoutes) }}">
                        <span style="width: {{ $progress }}%"></span>
                    </span>
                </div>
                <small class="scoreboard-ranking-games">{{ $team['completedGames'] }}/{{ $totalRoutes }} pos</small>
                <strong class="scoreboard-ranking-points">{{ number_format($team['totalPoints']) }}</strong>
            </article>
        @endforeach
    </section>
@else
    <div class="empty-state scoreboard-empty">Papan skor akan muncul setelah tim mendapatkan poin.</div>
@endif

@endsection
