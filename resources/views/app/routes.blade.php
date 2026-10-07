@extends('layouts.app')

@section('title', 'Route & Games')

@section('content')
<section class="page-heading">
    <span class="eyebrow">JALUR PETUALANGAN</span>
    <h1>Route &amp; Games</h1>
    <p>Setiap pos punya tantangan unik. Pilih rute untuk melihat detail permainan dan progres tim.</p>
</section>

@if(auth()->user()->isFacilitator())
    <details class="panel form-panel">
        <summary class="panel-summary"><span><b>Tambah pos permainan</b><small>Atur rute baru untuk kegiatan.</small></span><span class="button primary">Tambah pos <b>＋</b></span></summary>
        <form method="post" action="{{ route('routes.store') }}" class="form-grid">
            @csrf
            <label>Urutan pos<input type="number" name="position" min="0" required></label><label>Nama pos<input name="name" required minlength="2"></label>
            <label>Jenis permainan<input name="game_type" required minlength="2"></label><label>Lokasi<input name="location" required minlength="2"></label>
            <label>Durasi (menit)<input type="number" name="duration" min="0" required></label><label>Skor maksimum<input type="number" name="max_points" min="0" value="100" required></label>
            <label>Tingkat kesulitan<input name="difficulty" required minlength="2"></label><label>Warna<input type="color" name="color" value="#147b73"></label>
            <label class="wide">Deskripsi<textarea name="description" required minlength="2"></textarea></label>
            <label class="wide">Instruksi<textarea name="instruction" rows="4"></textarea></label>
            <button class="button primary" type="submit">Simpan pos <span>→</span></button>
        </form>
    </details>
@endif

<section class="page-section">
    <div class="route-grid">
        @forelse($routes as $route)
            <a class="route-card" href="{{ route('routes.show', $route) }}" style="--route-color: {{ $route->color }}">
                <span class="route-number">POS {{ str_pad($route->position, 2, '0', STR_PAD_LEFT) }}</span><span class="route-symbol">✦</span>
                <h3>{{ $route->name }}</h3><p>{{ $route->game_type }}</p>
                <div class="route-meta"><span>⌖ {{ $route->location }}</span><span>{{ $route->duration }} menit</span></div>
                <div class="route-footer"><span class="difficulty">{{ $route->difficulty }}</span><span>{{ $route->max_points }} poin maks.</span><span class="chevron">→</span></div>
            </a>
        @empty
            <div class="empty-state">Belum ada rute. Fasilitator dapat menambahkan pos pertama.</div>
        @endforelse
    </div>
</section>
@endsection
