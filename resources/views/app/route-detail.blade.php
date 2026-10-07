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
            <div class="checkin-heading">
                <h3>Check-in tim</h3>
                <strong>{{ $route->checkIns->count() }}/{{ $teams->count() }}</strong>
            </div>
            <p class="muted">Catat kehadiran setiap tim saat tiba di pos ini.</p>
            <div class="checkin-list">
                @forelse($teams as $team)
                    @php
                        $checkIn = $route->checkIns->firstWhere('team_id', $team->id);
                        $teamScore = $route->scores->firstWhere('team_id', $team->id);
                    @endphp
                    <div class="list-row compact checkin-team-row {{ $checkIn ? 'is-checked-in' : '' }}">
                        <span class="team-avatar">{{ $team->initials }}</span>
                        <div class="list-copy">
                            <b>{{ $team->name }}</b>
                            @if($checkIn)
                                <small class="checkin-status">✓ Check-in tersimpan{{ $teamScore ? ' · '.$teamScore->points.' poin' : '' }}</small>
                            @else
                                <small>Belum check-in di pos ini</small>
                            @endif
                            @if($teamScore?->photo_url)
                                <a class="score-evidence-link" href="{{ $teamScore->photo_url }}" target="_blank" rel="noopener">
                                    <img class="score-evidence checkin-evidence" src="{{ $teamScore->photo_url }}" alt="Bukti skor {{ $team->name }}" loading="lazy">
                                    <span>Lihat foto bukti</span>
                                </a>
                            @endif
                        </div>
                        <form method="post" action="{{ $checkIn ? route('checkins.destroy') : route('checkins.store') }}">
                            @csrf
                            @if($checkIn) @method('DELETE') @endif
                            <input type="hidden" name="team_id" value="{{ $team->id }}">
                            <input type="hidden" name="route_id" value="{{ $route->id }}">
                            <button class="button small {{ $checkIn ? 'subtle' : 'primary' }}" type="submit">{{ $checkIn ? 'Hadir' : 'Check-in' }}</button>
                        </form>
                    </div>
                @empty
                    <div class="empty-state">Belum ada tim terdaftar.</div>
                @endforelse
            </div>
            <form method="post" action="{{ route('scores.store') }}" enctype="multipart/form-data" class="form-grid score-form">@csrf
                <input type="hidden" name="route_id" value="{{ $route->id }}">
                <label>Tim<select name="team_id" required><option value="">Pilih tim yang sudah check-in</option>@foreach($teams as $team)@php $teamScore = $route->scores->firstWhere('team_id', $team->id); $teamCheckedIn = $route->checkIns->contains('team_id', $team->id); @endphp<option value="{{ $team->id }}" @disabled(!$teamCheckedIn || $teamScore)>{{ $team->name }}{{ $teamScore ? ' (Skor tersimpan)' : (!$teamCheckedIn ? ' (Belum check-in)' : '') }}</option>@endforeach</select></label>
                <label>Skor<input type="number" name="points" min="0" max="{{ $route->max_points }}" required></label>
                <label class="wide">Catatan<textarea name="note" rows="2"></textarea></label>
                <label class="wide">Foto bukti <small class="muted">JPG, PNG, WEBP · maks 5 MB</small><input id="score-photo" type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
                <img id="score-photo-preview" class="photo-preview score-photo-preview" alt="Pratinjau foto bukti" hidden>
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
                <article class="score-result">
                    <div class="score-result-heading"><b>{{ $score->team->name }}</b><strong class="points">{{ $score->points }} <small>PTS</small></strong></div>
                    <small class="checkin-status">✓ {{ $score->completed ? 'Game selesai' : 'Belum selesai' }}</small>
                    @if($score->note)<p>{{ $score->note }}</p>@endif
                    @if($score->photo_url)
                        <a class="score-evidence-link" href="{{ $score->photo_url }}" target="_blank" rel="noopener">
                            <img class="score-evidence result-evidence" src="{{ $score->photo_url }}" alt="Bukti skor {{ $score->team->name }}" loading="lazy">
                            <span>Buka foto bukti</span>
                        </a>
                    @endif
                </article>
            @empty
                <div class="empty-state">Belum ada skor untuk pos ini.</div>
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

@push('scripts')
<script>
const scorePhotoInput = document.getElementById('score-photo');
const scorePhotoPreview = document.getElementById('score-photo-preview');

scorePhotoInput?.addEventListener('change', () => {
    const file = scorePhotoInput.files?.[0];
    if (!file) {
        scorePhotoPreview.hidden = true;
        scorePhotoPreview.removeAttribute('src');
        return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        alert('Gunakan foto JPG, PNG, atau WEBP maksimal 5 MB.');
        scorePhotoInput.value = '';
        scorePhotoPreview.hidden = true;
        scorePhotoPreview.removeAttribute('src');
        return;
    }
    scorePhotoPreview.src = URL.createObjectURL(file);
    scorePhotoPreview.hidden = false;
});
</script>
@endpush
