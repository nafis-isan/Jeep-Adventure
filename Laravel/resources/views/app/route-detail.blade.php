@extends('layouts.app')

@section('title', $route->name)

@section('content')
<section class="page-heading route-detail-heading" style="--route-color: {{ $route->color }}">
    <a class="text-link" href="{{ route('routes') }}">← Kembali ke rute</a>
    <span class="eyebrow">POS {{ str_pad($route->position, 2, '0', STR_PAD_LEFT) }} · {{ $route->difficulty }}</span>
    <h1>{{ $route->name }}</h1>
    <p>{{ $route->game_type }} · {{ $route->location }} · {{ $route->duration }} menit · Maks. {{ $route->max_points }} poin</p>
</section>

<div class="detail-grid">
    <section class="panel">
        <span class="eyebrow">TANTANGAN POS</span><h2>{{ $route->game_type }}</h2>
        <p>{{ $route->description }}</p>
        <h3>Instruksi permainan</h3><p class="instruction">{{ $route->instruction ?: 'Instruksi permainan akan ditambahkan oleh fasilitator.' }}</p>
    </section>
    <section class="panel">
        <span class="eyebrow">PROGRES TIM</span><h2>Check-in &amp; skor</h2>
        @if(auth()->user()->isFacilitator())
            <form method="post" action="{{ route('checkins.store') }}" class="inline-form">@csrf
                <input type="hidden" name="route_id" value="{{ $route->id }}">
                <label class="grow">Check-in tim<select name="team_id" required><option value="">Pilih tim</option>@foreach($teams as $team)<option value="{{ $team->id }}">{{ $team->name }}</option>@endforeach</select></label>
                <button class="button primary" type="submit">Check-in</button>
            </form>
            <div class="checkin-list">
                @foreach($route->checkIns as $checkIn)
                    <div class="list-row compact"><span class="team-avatar">{{ $checkIn->team->initials }}</span><div class="list-copy"><b>{{ $checkIn->team->name }}</b><small>Sudah check-in</small></div>
                        <form method="post" action="{{ route('checkins.destroy') }}">@csrf @method('DELETE')<input type="hidden" name="team_id" value="{{ $checkIn->team_id }}"><input type="hidden" name="route_id" value="{{ $route->id }}"><button class="button small subtle" type="submit">Batalkan</button></form>
                    </div>
                @endforeach
            </div>
            <form method="post" action="{{ route('scores.store') }}" enctype="multipart/form-data" class="form-grid score-form">@csrf
                <input type="hidden" name="route_id" value="{{ $route->id }}">
                <label>Tim<select name="team_id" required><option value="">Pilih tim yang sudah check-in</option>@foreach($route->checkIns as $checkIn)<option value="{{ $checkIn->team_id }}">{{ $checkIn->team->name }}</option>@endforeach</select></label>
                <label>Skor<input type="number" name="points" min="0" max="{{ $route->max_points }}" required></label>
                <label class="wide">Catatan<textarea name="note" rows="2"></textarea></label>
                <label class="wide">Foto bukti <small class="muted">JPG, PNG, WEBP · maks 5 MB</small><input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
                <label class="check-field"><input type="checkbox" name="completed" value="1" required> Game telah selesai</label>
                <button class="button primary" type="submit">Simpan skor <span>→</span></button>
            </form>
        @else
            <div class="checkin-list">
                @forelse($route->checkIns as $checkIn)
                    <div class="list-row compact"><span class="team-avatar">{{ $checkIn->team->initials }}</span><div class="list-copy"><b>{{ $checkIn->team->name }}</b><small>Sudah check-in</small></div></div>
                @empty
                    <div class="empty-state">Belum ada tim check-in di pos ini.</div>
                @endforelse
            </div>
        @endif
        <h3>Skor tersimpan</h3>
        <div class="checkin-list">
            @forelse($route->scores as $score)
                <div class="list-row compact"><span class="team-avatar">{{ $score->team->initials }}</span><div class="list-copy"><b>{{ $score->team->name }}</b><small>{{ $score->note ?: 'Game selesai' }}</small></div><strong class="points">{{ $score->points }} <small>PTS</small></strong></div>
            @empty
                <p class="muted">Belum ada skor untuk pos ini.</p>
            @endforelse
        </div>
    </section>
</div>

@if(auth()->user()->isFacilitator())
    <details class="panel form-panel">
        <summary class="panel-summary"><span><b>Edit informasi pos</b><small>Perbarui detail, instruksi, atau nilai permainan.</small></span><span class="button subtle">Edit pos</span></summary>
        <form method="post" action="{{ route('routes.update', $route) }}" class="form-grid">@csrf @method('PATCH')
            <label>Nama pos<input name="name" value="{{ $route->name }}" required></label><label>Jenis permainan<input name="game_type" value="{{ $route->game_type }}" required></label>
            <label>Lokasi<input name="location" value="{{ $route->location }}" required></label><label>Durasi (menit)<input name="duration" type="number" min="1" value="{{ $route->duration }}" required></label>
            <label>Skor maksimum<input name="max_points" type="number" min="0" value="{{ $route->max_points }}" required></label><label>Tingkat kesulitan<input name="difficulty" value="{{ $route->difficulty }}" required></label>
            <label>Warna<input name="color" type="color" value="{{ $route->color }}"></label><label class="wide">Deskripsi<textarea name="description" required>{{ $route->description }}</textarea></label>
            <label class="wide">Instruksi permainan<textarea name="instruction" rows="4">{{ $route->instruction }}</textarea></label>
            <button class="button primary" type="submit">Simpan perubahan <span>→</span></button>
        </form>
    </details>
@endif
@endsection
