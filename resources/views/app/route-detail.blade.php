@extends('layouts.app')

@section('title', $route->name)

@section('content')
@php
    $routeColors = ['#e56a00', '#2563eb', '#0f9bb4', '#16a34a', '#9333ea', '#d99100'];
    $routeColor = $route->color ?: $routeColors[($route->position - 1) % count($routeColors)];
    $difficultyClass = match (mb_strtolower($route->difficulty)) {
        'mudah' => 'difficulty-easy',
        'sedang' => 'difficulty-medium',
        'sulit' => 'difficulty-hard',
        default => 'difficulty-other',
    };
@endphp
<section class="route-detail-banner" style="--route-color: {{ $routeColor }}">
    <a class="route-detail-banner-back" href="{{ route('routes') }}">← &nbsp; Rute</a>
    <span class="route-detail-banner-title">
        <span class="route-detail-banner-icon" aria-hidden="true">
            @switch($route->position)
                @case(1)
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></svg>
                    @break
                @case(2)
                    <svg viewBox="0 0 24 24"><path d="M8 4.5a2.5 2.5 0 1 1 4.6 1.3H18a2 2 0 0 1 2 2v3.4a2.5 2.5 0 1 0 0 5V19a2 2 0 0 1-2 2h-3.5a2.5 2.5 0 1 0-5 0H6a2 2 0 0 1-2-2v-3.4a2.5 2.5 0 1 0 0-5V7a2 2 0 0 1 2-2h3.3A2.5 2.5 0 0 1 8 4.5Z"/></svg>
                    @break
                @case(3)
                    <svg viewBox="0 0 24 24"><path d="M8 3.5S4.5 8 4.5 11a3.5 3.5 0 0 0 7 0C11.5 8 8 3.5 8 3.5Z"/><path d="M16.5 7s-3 3.8-3 6.5a3 3 0 0 0 6 0c0-2.7-3-6.5-3-6.5Z"/></svg>
                    @break
                @case(4)
                    <svg viewBox="0 0 24 24"><path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M16.5 10a2.5 2.5 0 1 0 0-5"/><path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19Z"/><path d="M16 13a4 4 0 0 1 4 4v2h-3"/></svg>
                    @break
                @case(5)
                    <svg viewBox="0 0 24 24"><path d="M8.5 6 10 4h4l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12.5" r="3.5"/></svg>
                    @break
                @default
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2 5.2-2.4Z"/></svg>
            @endswitch
        </span>
        <span><small>POS {{ $route->position }}</small><b>{{ $route->name }}</b></span>
    </span>
    <span class="route-detail-banner-meta">
        <span class="route-detail-game-badge">{{ $route->game_type }}</span>
        <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>{{ $route->location }}</span>
        <span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>{{ $route->duration }} menit</span>
        <span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></svg>Maks {{ $route->max_points }} poin</span>
    </span>
</section>

<div class="route-detail-layout route-detail-page {{ auth()->user()->isFacilitator() ? 'has-score-panel' : 'customer-route-detail' }}" style="--route-color: {{ $routeColor }}">
    <div class="route-detail-main">
        <section class="panel route-challenge-panel">
            <h2>Tentang {{ $route->game_type }}</h2>
            <p>{{ $route->description }}</p>
            <div class="route-instruction-block">
                <b><span class="route-instruction-icon" aria-hidden="true">
                    @switch($route->position)
                        @case(1) ◎ @break
                        @case(2) ♧ @break
                        @case(3) ♨ @break
                        @case(4) ♧ @break
                        @case(5) ▣ @break
                        @default ⊙
                    @endswitch
                </span>Instruksi Permainan</b>
                <p>{{ $route->instruction ?: 'Instruksi permainan akan ditambahkan oleh fasilitator.' }}</p>
            </div>
        </section>
        <section class="panel route-checkin-panel">
            <div class="checkin-heading">
                <div><h2><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H5a1 1 0 0 0-1 1v3m12-4h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m12-4v3a1 1 0 0 1-1 1h-3"/></svg>Check-in Tim</h2><p class="muted">Tim tap check-in saat tiba di pos ini.</p></div>
                <strong>{{ $route->checkIns->count() }}/{{ $teams->count() }}</strong>
            </div>
        @if(auth()->user()->isFacilitator())
            <div class="checkin-list">
                @forelse($teams as $team)
                    @php
                        $checkIn = $route->checkIns->firstWhere('team_id', $team->id);
                        $teamScore = $route->scores->firstWhere('team_id', $team->id);
                    @endphp
                    <div class="list-row compact checkin-team-row {{ $checkIn ? 'is-checked-in' : '' }}">
                        <span class="route-team-dot" style="--team-color: {{ $team->color ?? '#59746b' }}" aria-hidden="true"></span>
                        <div class="list-copy">
                            <b>{{ $team->name }}</b>
                            @if($checkIn)
                                <small class="checkin-status">✓ Check-in tersimpan{{ $teamScore ? ' · '.$teamScore->points.' poin' : '' }}</small>
                            @else
                                <small>Belum check-in di pos ini</small>
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
        @else
            <div class="checkin-list">
                @forelse($route->checkIns as $checkIn)
                    <div class="list-row compact"><span class="route-team-dot" style="--team-color: {{ $checkIn->team->color ?? '#59746b' }}" aria-hidden="true"></span><div class="list-copy"><b>{{ $checkIn->team->name }}</b><small>Sudah check-in</small></div></div>
                @empty
                    <div class="empty-state">Belum ada tim check-in di pos ini.</div>
                @endforelse
            </div>
        @endif
        </section>
        <section class="panel route-results-panel">
            <h2>Hasil Titik Ini</h2>
            <div class="route-result-list">
                @forelse($route->scores as $score)
                    <article class="route-result-row">
                        <span class="route-result-rank">{{ $loop->iteration }}</span>
                        <span class="route-team-dot" style="--team-color: {{ $score->team->color ?? '#59746b' }}" aria-hidden="true"></span>
                        <div class="list-copy">
                            <b>{{ $score->team->name }}</b>
                            <small class="checkin-status">✓ {{ $score->completed ? 'Game selesai' : 'Belum selesai' }}</small>
                            @if($score->note)<small>{{ $score->note }}</small>@endif
                        </div>
                        @if($score->photo_url)
                            <a class="route-result-photo" href="{{ $score->photo_url }}" target="_blank" rel="noopener" aria-label="Lihat foto bukti {{ $score->team->name }}">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7a2 2 0 0 1 2-2h2l1.5-2h5L16 5h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="12.5" r="3.5"/></svg>
                            </a>
                        @endif
                        <strong class="points">{{ $score->points }}</strong>
                    </article>
                @empty
                    <div class="empty-state">Belum ada skor untuk pos ini.</div>
                @endforelse
            </div>
        </section>
    </div>
    @if(auth()->user()->isFacilitator())
        <aside class="panel route-score-panel">
            <h2>Catat Skor Tim</h2>
            <p class="muted">Pilih tim, masukkan skor, dan unggah foto bukti.</p>
            <form method="post" action="{{ route('scores.store') }}" enctype="multipart/form-data" class="form-grid route-score-form">@csrf
                <input type="hidden" name="route_id" value="{{ $route->id }}">
                <label>Pilih Tim<select name="team_id" required><option value="">Pilih tim peserta</option>@foreach($teams as $team)@php $teamScore = $route->scores->firstWhere('team_id', $team->id); $teamCheckedIn = $route->checkIns->contains('team_id', $team->id); @endphp<option value="{{ $team->id }}" @disabled(!$teamCheckedIn || $teamScore)>{{ $team->name }}{{ $teamScore ? ' (Skor tersimpan)' : (!$teamCheckedIn ? ' (Belum check-in)' : '') }}</option>@endforeach</select></label>
                <label>Skor (maks {{ $route->max_points }})<input type="number" name="points" min="0" max="{{ $route->max_points }}" required></label>
                <label class="wide">Foto Bukti (Opsional)<input id="score-photo" type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
                <img id="score-photo-preview" class="photo-preview score-photo-preview wide" alt="Pratinjau foto bukti" hidden>
                <label class="wide">Catatan Panitia<textarea name="note" rows="3" placeholder="Catatan performa tim, pelanggaran, dll."></textarea></label>
                <label class="check-field route-complete-field"><input type="checkbox" name="completed" value="1" required><span>Tandai sebagai selesai</span></label>
                <button class="button primary wide" type="submit">Simpan Skor</button>
            </form>
        </aside>
    @endif
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
