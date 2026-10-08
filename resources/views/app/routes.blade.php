@extends('layouts.app')

@section('title', 'Route & Games')

@section('content')
@php
    $routeColors = ['#e56a00', '#2563eb', '#0f9bb4', '#16a34a', '#9333ea', '#d99100'];
@endphp
<section class="page-heading route-page-heading">
    <div class="route-page-heading-top">
        <div>
            <span class="route-page-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12a3 3 0 0 1 2.9 2.2l1 4A3 3 0 0 1 19 18h-1l-2-2H8l-2 2H5a3 3 0 0 1-2.9-3.8l1-4A3 3 0 0 1 6 8Z"/><path d="M7 11v4m-2-2h4m7-1h.01M18 14h.01"/></svg> RUTE PETUALANGAN</span>
            <h1>Titik Pemberhentian &amp; Mini Games</h1>
            <p>Setiap pos sepanjang rute jeep menyimpan satu mini game. Buka titik untuk membaca instruksi dan mencatat skor tim.</p>
        </div>
        @if(auth()->user()->isFacilitator())
            <button class="button primary route-add-button" type="button" data-open-route-modal><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg> Tambah Pos</button>
        @endif
    </div>
</section>

@if(auth()->user()->isFacilitator())
    <dialog class="route-modal" data-route-modal aria-labelledby="route-modal-title">
        <div class="route-modal-header">
            <h2 id="route-modal-title">Tambah Pos &amp; Mini Game</h2>
            <button class="route-modal-close" type="button" aria-label="Tutup" data-close-route-modal>×</button>
        </div>
        @if($errors->any() && old('name'))
            <div class="flash error route-modal-errors" role="alert">
                <b>Periksa kembali data pos.</b>
                <ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
            </div>
        @endif
        <form method="post" action="{{ route('routes.store') }}" class="form-grid route-modal-form">
            @csrf
            @php
                $defaultPosition = $routes->max('position') + 1;
            @endphp
            <label>Urutan Pos<input type="number" name="position" min="0" value="{{ old('position', $defaultPosition) }}" required></label>
            <label>Nama Pos<input name="name" value="{{ old('name') }}" required minlength="2" placeholder="Mis. Pos Merapi"></label>
            <label>Jenis Game<input name="game_type" value="{{ old('game_type') }}" required minlength="2" placeholder="Mis. Team Puzzle"></label>
            <label>Durasi (Menit)<input type="number" name="duration" min="0" value="{{ old('duration', 15) }}" required></label>
            <label class="wide">Deskripsi<textarea name="description" rows="3" required minlength="2" placeholder="Jelaskan tantangan di pos ini">{{ old('description') }}</textarea></label>
            <label>Lokasi<input name="location" value="{{ old('location') }}" required minlength="2" placeholder="Mis. Hutan Pinus"></label>
            <label>Skor Maksimum<input type="number" name="max_points" min="0" value="{{ old('max_points', 100) }}" required></label>
            <label class="wide">Kesulitan<select name="difficulty" required>
                @foreach(['Mudah', 'Sedang', 'Sulit'] as $difficulty)
                    <option value="{{ $difficulty }}" @selected(old('difficulty', 'Mudah') === $difficulty)>{{ $difficulty }}</option>
                @endforeach
            </select></label>
            @include('app.partials.route-icon-picker', ['selectedIcon' => old('icon', \App\Models\AdventureRoute::iconForPosition((int) $defaultPosition))])
            <fieldset class="route-color-picker">
                <legend>Warna Identitas</legend>
                @foreach([
                    '#356f3d' => 'Hijau',
                    '#ed5b18' => 'Oranye',
                    '#2868e8' => 'Biru',
                    '#9634e8' => 'Ungu',
                    '#1299b7' => 'Toska',
                    '#d69200' => 'Emas',
                    '#e52d2d' => 'Merah',
                    '#147b73' => 'Hijau Jeep',
                ] as $color => $colorName)
                    <label class="route-color-option" title="{{ $colorName }}">
                        <input type="radio" name="color" value="{{ $color }}" @checked(old('color', '#356f3d') === $color) required aria-label="{{ $colorName }}">
                        <span style="--route-choice-color: {{ $color }}"></span>
                    </label>
                @endforeach
            </fieldset>
            <label class="wide">Instruksi Permainan <small class="muted">(Opsional)</small><textarea name="instruction" rows="3" placeholder="Tulis instruksi untuk fasilitator">{{ old('instruction') }}</textarea></label>
            <div class="route-modal-actions wide">
                <button class="button primary" type="submit">＋ Simpan Pos</button>
                <button class="button subtle" type="button" data-close-route-modal>Batalkan</button>
            </div>
        </form>
    </dialog>
@endif

<section class="route-list">
        @forelse($routes as $route)
            @php
                $routeColor = $route->color ?: $routeColors[($route->position - 1) % count($routeColors)];
                $completedCount = $route->completed_scores_count;
                $progress = $totalTeams > 0 ? min(100, ($completedCount / $totalTeams) * 100) : 0;
                $difficultyClass = match (mb_strtolower($route->difficulty)) {
                    'mudah' => 'difficulty-easy',
                    'sedang' => 'difficulty-medium',
                    'sulit' => 'difficulty-hard',
                    default => 'difficulty-other',
                };
            @endphp
            <a class="route-list-card" href="{{ route('routes.show', $route) }}" style="--route-color: {{ $routeColor }}">
                <span class="route-card-rail">
                    <small>POS</small>
                    <b>{{ $route->position }}</b>
                    @include('app.partials.route-icon', ['icon' => $route->icon])
                </span>
                <span class="route-list-content">
                    <span class="route-game-badge">
                        <span class="route-game-icon" aria-hidden="true">
                            @include('app.partials.route-icon', ['icon' => $route->icon])
                        </span>
                        {{ $route->game_type }}
                    </span>
                    <b class="route-list-name">{{ $route->name }}</b>
                    <span class="route-list-description">{{ $route->description }}</span>
                    <span class="route-list-meta">
                        <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>{{ $route->location }}</span>
                        <span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>{{ $route->duration }} menit</span>
                        <span class="route-difficulty {{ $difficultyClass }}">{{ $route->difficulty }}</span>
                        @if($route->check_ins_count > 0)
                            <span class="route-checkin-count"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H5a1 1 0 0 0-1 1v3m12-4h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m12-4v3a1 1 0 0 1-1 1h-3"/></svg>{{ $route->check_ins_count }} check-in</span>
                        @endif
                    </span>
                    <span class="route-progress">
                        <span class="route-progress-label"><span>Tim selesai</span><b>{{ $completedCount }}/{{ $totalTeams }}</b></span>
                        <span class="route-progress-track"><span style="width: {{ $progress }}%"></span></span>
                    </span>
                </span>
                <span class="route-list-chevron" aria-hidden="true">›</span>
            </a>
        @empty
            <div class="empty-state">Belum ada rute. Fasilitator dapat menambahkan pos pertama.</div>
        @endforelse
</section>
@endsection

@if(auth()->user()->isFacilitator())
    @push('scripts')
        <script>
            const routeModal = document.querySelector('[data-route-modal]');
            document.querySelector('[data-open-route-modal]')?.addEventListener('click', () => routeModal?.showModal());
            document.querySelectorAll('[data-close-route-modal]').forEach((button) => {
                button.addEventListener('click', () => routeModal?.close());
            });
            routeModal?.addEventListener('click', (event) => {
                if (event.target === routeModal) routeModal.close();
            });
            @if($errors->any() && old('name'))
                routeModal?.showModal();
            @endif
        </script>
    @endpush
@endif
