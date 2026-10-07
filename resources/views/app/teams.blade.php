@extends('layouts.app')

@section('title', 'Tim')

@section('content')
<section class="page-heading teams-page-heading">
    <div class="teams-page-heading-top">
        <div>
            <span class="route-page-badge"><span aria-hidden="true">♧</span> TIM PESERTA</span>
            <h1>Daftar Tim</h1>
            <p>Kelola tim yang bertualang di rute Jeep Adventure.</p>
        </div>
        <button class="button primary route-add-button" type="button" data-open-team-modal>
            {{ auth()->user()->isFacilitator() ? '+ Tambah Tim' : '+ Daftarkan Tim' }}
        </button>
    </div>
</section>

@if(auth()->user()->isFacilitator())
    <dialog class="route-modal team-modal" data-team-modal aria-labelledby="team-modal-title">
        <div class="route-modal-header">
            <h2 id="team-modal-title">Tambah Tim Peserta</h2>
            <button class="route-modal-close" type="button" aria-label="Tutup" data-close-team-modal>×</button>
        </div>
        @if($errors->any() && old('name'))
            <div class="flash error route-modal-errors" role="alert">
                <b>Periksa kembali data tim.</b>
                <ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
            </div>
        @endif
        <form method="post" action="{{ route('teams.store') }}" class="form-grid route-modal-form">
            @csrf
            <label>Nama Tim<input name="name" value="{{ old('name') }}" minlength="2" required placeholder="Contoh: Garuda Offroad"></label>
            <label>Motto Tim<input name="motto" value="{{ old('motto') }}" minlength="2" required placeholder="Jelajah tanpa batas!"></label>
            <label class="wide">Nama Anggota <small class="muted">(satu nama per baris)</small><textarea name="members_text" rows="2" placeholder="Nama anggota 1&#10;Nama anggota 2">{{ old('members_text') }}</textarea></label>
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
                        <input type="radio" name="color" value="{{ $color }}" @checked(old('color', '#2e9d63') === $color) required aria-label="{{ $colorName }}">
                        <span style="--team-color: {{ $color }}"></span>
                    </label>
                @endforeach
            </fieldset>
            <fieldset class="field-group team-account-fields"><legend>Akun peserta</legend>
                <label>Nama<input name="account_name" value="{{ old('account_name') }}" required></label>
                <label>Email<input type="email" name="account_email" value="{{ old('account_email') }}" required></label>
                <label>Password<input type="password" name="account_password" minlength="8" required></label>
                <label>Peran<select name="account_role"><option value="CUSTOMER" @selected(old('account_role', 'CUSTOMER') === 'CUSTOMER')>Customer</option><option value="FACILITATOR" @selected(old('account_role') === 'FACILITATOR')>Fasilitator</option></select></label>
            </fieldset>
            <div class="route-modal-actions wide">
                <button class="button primary" type="submit">＋ Simpan Tim</button>
                <button class="button subtle" type="button" data-close-team-modal>Batalkan</button>
            </div>
        </form>
    </dialog>
@else
    <dialog class="route-modal team-modal" data-team-modal aria-labelledby="team-modal-title">
        <div class="route-modal-header">
            <h2 id="team-modal-title">Daftarkan Tim</h2>
            <button class="route-modal-close" type="button" aria-label="Tutup" data-close-team-modal>×</button>
        </div>
        @if($errors->any() && old('name'))
            <div class="flash error route-modal-errors" role="alert">
                <b>Periksa kembali data tim.</b>
                <ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
            </div>
        @endif
        <form method="post" action="{{ route('teams.store') }}" class="form-grid route-modal-form">
            @csrf
            <label>Nama Tim<input name="name" value="{{ old('name') }}" required minlength="2" placeholder="Nama tim"></label>
            <label>Motto Tim<input name="motto" value="{{ old('motto') }}" required minlength="2" placeholder="Motto tim"></label>
            <label class="wide">Nama Anggota <small class="muted">(satu nama per baris)</small><textarea name="members_text" rows="3" placeholder="Nama anggota 1&#10;Nama anggota 2">{{ old('members_text') }}</textarea></label>
            <div class="route-modal-actions wide">
                <button class="button primary" type="submit">Kirim Pendaftaran</button>
                <button class="button subtle" type="button" data-close-team-modal>Batalkan</button>
            </div>
        </form>
    </dialog>
@endif

<section class="page-section teams-page-section">
    <div class="section-heading"><div><span class="eyebrow">PESERTA</span><h2>{{ $teams->count() }} tim terdaftar</h2></div></div>
    <div class="team-grid teams-card-grid">
        @forelse($teams as $team)
            <article class="team-card teams-list-card" style="--team-color: {{ $team['color'] ?? '#59746b' }}">
                <div class="teams-card-top">
                    <span class="team-avatar teams-list-avatar team-color-avatar">{{ $team['initials'] }}</span>
                    <span class="teams-card-identity"><b>{{ $team['name'] }}</b><small>{{ count($team['members'] ?? []) }} anggota</small></span>
                    <span class="status status-{{ strtolower($team['status']) }}">{{ strtolower($team['status']) === 'approved' ? 'Disetujui' : (strtolower($team['status']) === 'rejected' ? 'Ditolak' : 'Menunggu') }}</span>
                </div>
                <p class="team-motto">“{{ $team['motto'] }}”</p>
                <div class="teams-card-stats">
                    <span><b>{{ $team['completedRoutes'] }}</b> pos</span>
                    <strong>{{ number_format($team['totalPoints']) }} <small>total poin</small></strong>
                </div>
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

@push('scripts')
    <script>
        const teamModal = document.querySelector('[data-team-modal]');
        document.querySelector('[data-open-team-modal]')?.addEventListener('click', () => teamModal?.showModal());
        document.querySelectorAll('[data-close-team-modal]').forEach((button) => {
            button.addEventListener('click', () => teamModal?.close());
        });
        teamModal?.addEventListener('click', (event) => {
            if (event.target === teamModal) teamModal.close();
        });
        @if($errors->any() && old('name'))
            teamModal?.showModal();
        @endif
    </script>
@endpush
