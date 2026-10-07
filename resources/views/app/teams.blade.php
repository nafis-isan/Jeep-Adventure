@extends('layouts.app')

@section('title', 'Tim')

@section('content')
<section class="page-heading">
    <span class="eyebrow">KOMUNITAS PETUALANG</span>
    <h1>Tim Peserta</h1>
    <p>Kenali tim yang akan menaklukkan setiap tantangan di rute Jeep Adventure.</p>
</section>

@if(auth()->user()->isFacilitator())
    <details class="panel form-panel" {{ $errors->has('account_email') || old('name') ? 'open' : '' }}>
        <summary class="panel-summary"><span><b>Tambah tim peserta</b><small>Daftarkan tim baru dan buat akun untuk peserta.</small></span><span class="button primary">Tambah tim <b>＋</b></span></summary>
        <form method="post" action="{{ route('teams.store') }}" class="form-grid">
            @csrf
            <label>Nama tim<input name="name" value="{{ old('name') }}" minlength="2" required placeholder="Contoh: Garuda Offroad"></label>
            <label>Motto tim<input name="motto" value="{{ old('motto') }}" minlength="2" required placeholder="Jelajah tanpa batas!"></label>
            <label>Nama anggota <small class="muted">(satu nama per baris)</small><textarea name="members_text" rows="3" placeholder="Nama anggota 1&#10;Nama anggota 2">{{ old('members_text') }}</textarea></label>
            <fieldset class="team-color-picker"><legend>Warna identitas tim</legend>
                @foreach([
                    '#2e9d63' => 'Hijau',
                    '#e8833a' => 'Oranye',
                    '#2868e8' => 'Biru',
                    '#9634e8' => 'Ungu',
                    '#1299b7' => 'Toska',
                    '#d69200' => 'Emas',
                    '#e52d2d' => 'Merah',
                    '#147b73' => 'Hijau Jeep',
                ] as $color => $colorName)
                    <label class="team-color-option" title="{{ $colorName }}">
                        <input type="radio" name="color" value="{{ $color }}" @checked(old('color', '#2e9d63') === $color) required>
                        <span style="--team-color: {{ $color }}"></span>
                        <small>{{ $colorName }}</small>
                    </label>
                @endforeach
            </fieldset>
            <fieldset class="field-group"><legend>Akun peserta</legend>
                <label>Nama<input name="account_name" value="{{ old('account_name') }}" required></label>
                <label>Email<input type="email" name="account_email" value="{{ old('account_email') }}" required></label>
                <label>Password<input type="password" name="account_password" minlength="8" required></label>
                <label>Peran<select name="account_role"><option value="CUSTOMER">Customer</option><option value="FACILITATOR">Fasilitator</option></select></label>
            </fieldset>
            <button class="button primary" type="submit">Simpan tim dan akun <span>→</span></button>
        </form>
    </details>
@else
    <details class="panel form-panel">
        <summary class="panel-summary"><span><b>Daftarkan tim</b><small>Pendaftaran baru menunggu persetujuan fasilitator.</small></span><span class="button primary">Daftar tim <b>＋</b></span></summary>
        <form method="post" action="{{ route('teams.store') }}" class="form-grid">
            @csrf
            <label>Nama tim<input name="name" value="{{ old('name') }}" required minlength="2"></label>
            <label>Motto tim<input name="motto" value="{{ old('motto') }}" required minlength="2"></label>
            <label>Nama anggota <small class="muted">(satu nama per baris)</small><textarea name="members_text" rows="3"></textarea></label>
            <button class="button primary" type="submit">Kirim pendaftaran <span>→</span></button>
        </form>
    </details>
@endif

<section class="page-section">
    <div class="section-heading"><div><span class="eyebrow">PESERTA</span><h2>{{ $teams->count() }} tim terdaftar</h2></div></div>
    <div class="team-grid">
        @forelse($teams as $team)
            <article class="team-card" style="--team-color: {{ $team['color'] ?? '#59746b' }}">
                <div class="team-card-top"><span class="team-avatar large team-color-avatar">{{ $team['initials'] }}</span><span class="status status-{{ strtolower($team['status']) }}">{{ strtolower($team['status']) === 'approved' ? 'Disetujui' : (strtolower($team['status']) === 'rejected' ? 'Ditolak' : 'Menunggu') }}</span></div>
                <h3>{{ $team['name'] }}</h3><p class="team-motto">“{{ $team['motto'] }}”</p>
                <div class="team-stats"><span>{{ count($team['members'] ?? []) }} anggota</span><span>{{ $team['completedRoutes'] }} pos dikunjungi</span><b>{{ number_format($team['totalPoints']) }} poin</b></div>
                @if(auth()->user()->isFacilitator())
                    <div class="team-actions">
                        @if(strtoupper($team['status']) !== 'APPROVED')
                            <form method="post" action="{{ route('teams.status', $team['id']) }}">@csrf @method('PATCH')<input type="hidden" name="status" value="approved"><button class="button small primary" type="submit">Setujui</button></form>
                        @endif
                        @if(strtoupper($team['status']) !== 'REJECTED')
                            <form method="post" action="{{ route('teams.status', $team['id']) }}">@csrf @method('PATCH')<input type="hidden" name="status" value="rejected"><button class="button small subtle" type="submit">Tolak</button></form>
                        @endif
                        <form method="post" action="{{ route('teams.destroy', $team['id']) }}" onsubmit="return confirm('Hapus tim {{ addslashes($team['name']) }}?')">@csrf @method('DELETE')<button class="button small danger" type="submit">Hapus</button></form>
                    </div>
                @endif
            </article>
        @empty
            <div class="empty-state">Belum ada tim terdaftar.</div>
        @endforelse
    </div>
</section>
@endsection
