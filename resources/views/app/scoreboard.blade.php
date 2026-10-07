@extends('layouts.app')

@section('title', 'Papan Skor')

@section('content')
<section class="page-heading">
    <span class="eyebrow">PERFORMA PETUALANGAN</span><h1>Papan Skor</h1>
    <p>Peringkat tim dihitung dari total poin seluruh permainan yang telah diselesaikan.</p>
</section>
<section class="page-section">
    <div class="leaderboard">
        @forelse($leaderboard as $index => $team)
            <article class="leader-row {{ $index < 3 ? 'top-rank rank-'.$index : '' }}">
                <span class="rank">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</span><span class="team-avatar large">{{ $team['initials'] }}</span>
                <div class="list-copy"><b>{{ $team['name'] }}</b><small>{{ $team['completedGames'] }} game selesai</small></div>
                <strong class="points">{{ number_format($team['totalPoints']) }} <small>PTS</small></strong>
            </article>
        @empty
            <div class="empty-state">Papan skor akan muncul setelah tim mendapatkan poin.</div>
        @endforelse
    </div>
</section>
@if($scores->isNotEmpty())
    <section class="page-section"><div class="section-heading"><div><span class="eyebrow">HASIL TERBARU</span><h2>Skor permainan</h2></div></div>
        <div class="table-card">@foreach($scores as $score)<div class="list-row"><span class="team-avatar">{{ $score->team->initials }}</span><div class="list-copy"><b>{{ $score->team->name }} · {{ $score->route->name }}</b><small>{{ $score->created_at->format('d M Y, H:i') }}{{ $score->note ? ' · '.$score->note : '' }}</small></div><strong class="points">{{ $score->points }} <small>PTS</small></strong></div>@endforeach</div>
    </section>
@endif
@endsection
