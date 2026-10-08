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
    <div class="route-detail-banner-top">
        <a class="route-detail-banner-back" href="{{ route('routes') }}">← &nbsp; Rute</a>
        @if(auth()->user()->isFacilitator())
            <button class="button route-edit-trigger" type="button" data-open-route-edit-modal>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-.8L19.3 7.9a2.1 2.1 0 0 0-3-3L5 16.2 4 20Z"/></svg>
                Edit Pos
            </button>
        @endif
    </div>
    <span class="route-detail-banner-title">
        <span class="route-detail-banner-icon" aria-hidden="true">
            @include('app.partials.route-icon', ['icon' => $route->icon])
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

@if(auth()->user()->isFacilitator())
    <dialog class="route-modal route-edit-modal" data-route-edit-modal aria-labelledby="route-edit-modal-title">
        <div class="route-modal-header">
            <h2 id="route-edit-modal-title">Edit Pos</h2>
            <button class="route-modal-close" type="button" aria-label="Tutup" data-close-route-edit-modal>×</button>
        </div>
        @if($errors->any() && old('name'))
            <div class="flash error route-modal-errors" role="alert">
                <b>Periksa kembali data pos.</b>
                <ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
            </div>
        @endif
        <form method="post" action="{{ route('routes.update', $route) }}" class="form-grid route-modal-form">
            @csrf
            @method('PATCH')
            <label>Nama Pos<input name="name" value="{{ old('name', $route->name) }}" required minlength="2"></label>
            <label>Jenis Game<input name="game_type" value="{{ old('game_type', $route->game_type) }}" required minlength="2"></label>
            <label>Lokasi<input name="location" value="{{ old('location', $route->location) }}" required minlength="2"></label>
            <label>Durasi (Menit)<input name="duration" type="number" min="1" value="{{ old('duration', $route->duration) }}" required></label>
            <label>Skor Maksimum<input name="max_points" type="number" min="0" value="{{ old('max_points', $route->max_points) }}" required></label>
            <label>Kesulitan<select name="difficulty" required>
                @foreach(array_unique(['Mudah', 'Sedang', 'Sulit', $route->difficulty]) as $difficulty)
                    <option value="{{ $difficulty }}" @selected(old('difficulty', $route->difficulty) === $difficulty)>{{ $difficulty }}</option>
                @endforeach
            </select></label>
            @include('app.partials.route-icon-picker', ['selectedIcon' => old('icon', $route->icon)])
            <label>Warna Identitas<input name="color" type="color" value="{{ old('color', $route->color ?: $routeColor) }}" required></label>
            <label class="wide">Deskripsi<textarea name="description" rows="3" required minlength="2">{{ old('description', $route->description) }}</textarea></label>
            <label class="wide">Instruksi Permainan <small class="muted">(Opsional)</small><textarea name="instruction" rows="3">{{ old('instruction', $route->instruction) }}</textarea></label>
            <div class="route-modal-actions wide">
                <button class="button primary" type="submit">Simpan Perubahan</button>
                <button class="button subtle" type="button" data-close-route-edit-modal>Batalkan</button>
            </div>
        </form>
    </dialog>
@endif

<div class="route-detail-layout route-detail-page {{ auth()->user()->isFacilitator() ? 'has-score-panel' : 'customer-route-detail' }}" style="--route-color: {{ $routeColor }}">
    <div class="route-detail-main">
        <section class="panel route-challenge-panel">
            <h2>Tentang {{ $route->game_type }}</h2>
            <p>{{ $route->description }}</p>
            <div class="route-instruction-block">
                <b><span class="route-instruction-icon" aria-hidden="true">@include('app.partials.route-icon', ['icon' => $route->icon])</span>Instruksi Permainan</b>
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
                                <img class="route-result-photo-image" src="{{ $score->photo_url }}" alt="Bukti foto {{ $score->team->name }} di {{ $route->name }}" loading="lazy" decoding="async">
                                <span>Bukti foto</span>
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

@endsection

@push('scripts')
<script>
const scorePhotoInput = document.getElementById('score-photo');
const scorePhotoPreview = document.getElementById('score-photo-preview');
const routeEditModal = document.querySelector('[data-route-edit-modal]');

document.querySelector('[data-open-route-edit-modal]')?.addEventListener('click', () => routeEditModal?.showModal());
document.querySelectorAll('[data-close-route-edit-modal]').forEach((button) => {
    button.addEventListener('click', () => routeEditModal?.close());
});
routeEditModal?.addEventListener('click', (event) => {
    if (event.target === routeEditModal) routeEditModal.close();
});
@if($errors->any() && old('name'))
    routeEditModal?.showModal();
@endif

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
