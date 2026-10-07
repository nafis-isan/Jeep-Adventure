@extends('layouts.app')

@section('title', 'Papan Skor')

@section('content')
@php
    $podiumTeams = $leaderboard->take(3);
    $remainingTeams = $leaderboard->skip(3);
@endphp
<section class="scoreboard-heading">
    <span class="scoreboard-badge">🏆 <span>PAPAN SKOR</span></span>
    <h1>Peringkat Tim</h1>
    <p>Peringkat sementara berdasarkan akumulasi skor mini games.</p>
</section>

@if($leaderboard->isNotEmpty())
    <section class="podium-stage" aria-label="Podium tiga tim teratas">
        @foreach($podiumTeams as $index => $team)
            @php
                $rank = $index + 1;
                $progress = $totalRoutes > 0 ? min(100, round($team['completedGames'] / $totalRoutes * 100)) : 0;
                $podiumClasses = [
                    1 => 'podium-first rank-first podium-rank-1',
                    2 => 'podium-second rank-second podium-rank-2',
                    3 => 'podium-third rank-third podium-rank-3',
                ];
                $medals = [1 => '🥇', 2 => '🥈', 3 => '🥉'];
            @endphp
            <article class="podium-card {{ $podiumClasses[$rank] }} rank-{{ $rank }}" style="--team-color: {{ $team['color'] ?? '#59746b' }}">
                <span class="podium-medal" aria-label="Peringkat {{ $rank }}">{{ $medals[$rank] }}</span>
                <span class="team-avatar podium-avatar team-color-avatar">{{ $team['initials'] }}</span>
                <span class="podium-place">{{ $rank === 1 ? 'JUARA 1' : 'JUARA '.$rank }}</span>
                <b class="podium-team-name">{{ $team['name'] }}</b>
                <span class="podium-score">{{ number_format($team['totalPoints']) }} <small>poin</small></span>
                <span class="podium-games">{{ $team['completedGames'] }}/{{ $totalRoutes }} game selesai</span>
                <div class="leader-progress podium-progress" role="progressbar" aria-label="Pos selesai" aria-valuenow="{{ $team['completedGames'] }}" aria-valuemin="0" aria-valuemax="{{ max(1, $totalRoutes) }}">
                    <span style="width: {{ $progress }}%"></span>
                </div>
                <span class="podium-platform" aria-hidden="true"><b>{{ $rank }}</b></span>
            </article>
        @endforeach
    </section>
    @if($remainingTeams->isNotEmpty())
        <section class="leaderboard remaining-leaderboard" aria-label="Peringkat tim lainnya">
            <h2>Peringkat lainnya</h2>
            @foreach($remainingTeams as $index => $team)
                @php
                    $rank = $index + 4;
                    $progress = $totalRoutes > 0 ? min(100, round($team['completedGames'] / $totalRoutes * 100)) : 0;
                @endphp
                <article class="leader-row remaining-leader-row" style="--team-color: {{ $team['color'] ?? '#59746b' }}">
                    <span class="remaining-rank">{{ $rank }}</span>
                    <span class="team-avatar team-color-avatar">{{ $team['initials'] }}</span>
                    <div class="list-copy podium-team-copy">
                        <b>{{ $team['name'] }}</b>
                        <div class="leader-progress" role="progressbar" aria-label="Pos selesai" aria-valuenow="{{ $team['completedGames'] }}" aria-valuemin="0" aria-valuemax="{{ max(1, $totalRoutes) }}">
                            <span style="width: {{ $progress }}%"></span>
                        </div>
                        <small>{{ $team['completedGames'] }}/{{ $totalRoutes }} pos</small>
                    </div>
                    <strong class="points podium-total-points">{{ number_format($team['totalPoints']) }}</strong>
                </article>
            @endforeach
        </section>
    @endif
@else
    <div class="empty-state scoreboard-empty">Papan skor akan muncul setelah tim mendapatkan poin.</div>
@endif

@if($scores->isNotEmpty())
    <section class="page-section"><div class="section-heading"><div><span class="eyebrow">HASIL TERBARU</span><h2>Skor permainan</h2></div></div>
        <div class="table-card">@foreach($scores as $score)<div class="list-row"><span class="team-avatar">{{ $score->team->initials }}</span><div class="list-copy"><b>{{ $score->team->name }} · {{ $score->route->name }}</b><small>{{ $score->created_at->format('d M Y, H:i') }}{{ $score->note ? ' · '.$score->note : '' }}</small></div><strong class="points">{{ $score->points }} <small>PTS</small></strong></div>@endforeach</div>
    </section>
@endif
@endsection
