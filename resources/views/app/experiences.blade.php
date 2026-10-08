@extends('layouts.app')

@section('title', 'Bagikan Pengalaman')

@section('content')
<section class="experience-hero">
    <div class="experience-hero-copy">
        <span class="experience-hero-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/></svg> OFFROAD · TEAM BUILDING · MINI GAMES</span>
        <h1>Petualangan Lebih Seru Jika Dibagikan.</h1>
        <p>Dengarkan cerita tim lain, bagikan keseruanmu, dan beri inspirasi untuk petualangan berikutnya.</p>
    </div>
</section>

<div class="experience-main-grid">
    <section class="panel experience-form-panel">
        <form id="experience-form" method="post" action="{{ route('experiences.store') }}" enctype="multipart/form-data" class="experience-share-form">
            @csrf
            <label>Rute &amp; Game
                <select name="route_id" required>
                    <option value="">Pilih rute</option>
                    @foreach($routes as $route)
                        <option value="{{ $route->id }}" @selected(old('route_id') === $route->id)>{{ $route->name }} · {{ $route->game_type }}</option>
                    @endforeach
                </select>
            </label>
            <label>Nama Tim
                <select name="team_id" required>
                    <option value="">Pilih tim</option>
                    @foreach($teams as $team)
                        <option value="{{ $team->id }}" @selected(old('team_id') === $team->id)>{{ $team->name }}</option>
                    @endforeach
                </select>
            </label>
            <fieldset class="experience-rating-picker">
                <legend>Rating Bintang (1–5)</legend>
                <div class="experience-rating-options">
                    @foreach([5, 4, 3, 2, 1] as $rating)
                        <label aria-label="{{ $rating }} dari 5 bintang">
                            <input type="radio" name="rating" value="{{ $rating }}" @checked((int) old('rating', 5) === $rating) required>
                            <span aria-hidden="true">★</span>
                        </label>
                    @endforeach
                    <small id="experience-rating-value">{{ number_format((int) old('rating', 5), 1) }}</small>
                </div>
            </fieldset>
            <label class="experience-story-field">Cerita Keseruan
                <textarea name="story" rows="3" maxlength="280" required placeholder="Mis. Jelajahi tanpa batas!">{{ old('story') }}</textarea>
                <small class="muted"><span id="story-count">{{ mb_strlen(old('story', '')) }}</span>/280 karakter</small>
            </label>
            <label class="experience-upload-control">
                <span class="experience-upload-button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M5 14v5h14v-5"/></svg> Unggah</span>
                <small>Foto JPG/PNG/WEBP maksimal 5 MB</small>
                <input id="experience-photo" type="file" name="photo" accept="image/jpeg,image/png,image/webp">
            </label>
            <img id="photo-preview" class="photo-preview experience-photo-preview" alt="Pratinjau foto" hidden>
            <div class="experience-submit-row">
                <span id="experience-notice" class="muted" role="status">Cerita tersimpan. Caption disalin jika browser mengizinkan, lalu lanjutkan postingan di Instagram.</span>
                <button class="button primary" type="submit">Kirim Pengalaman</button>
            </div>
        </form>
    </section>

    <section class="panel gallery-section">
        <div class="experience-section-heading">
            <div><h2>Galeri Pengalaman Tim</h2><span class="count-pill">{{ $experienceStats['stories'] }} item</span></div>
            <div class="filter-row" aria-label="Filter galeri">
                <button class="filter-button active" type="button" data-filter="all">Semua</button>
                <button class="filter-button" type="button" data-filter="photo">Foto</button>
            </div>
        </div>
        <div class="experience-grid">
            @forelse($experiences as $experience)
                <article class="experience-card" data-has-photo="{{ $experience->media_path ? 'true' : 'false' }}">
                    @if($experience->media_path)
                        <img class="experience-photo" src="{{ $experience->media_url }}" alt="Momen tim {{ $experience->team->name }}">
                    @else
                        <div class="experience-placeholder" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 19 9 8l3 6 2-4 6 9H4Z"/><circle cx="17" cy="7" r="2"/></svg></div>
                    @endif
                    <div class="experience-card-body">
                        <b class="experience-card-story">{{ $experience->story }}</b>
                        <div class="experience-card-meta"><span>{{ $experience->user->name }}, {{ $experience->team->name }}</span><b>★ {{ number_format($experience->rating, 1) }}</b></div>
                        <button type="button" class="text-link share-story" data-team="{{ $experience->team->name }}" data-story="{{ $experience->story }}" data-photo="{{ $experience->media_url }}">Bagikan →</button>
                    </div>
                </article>
            @empty
                <div class="empty-state">Belum ada pengalaman tersimpan. Jadilah yang pertama membagikan cerita!</div>
            @endforelse
        </div>
    </section>
</div>

<div class="experience-lower-grid">
    <section class="experience-stats-grid" aria-label="Statistik pengalaman">
        <article class="experience-stat-card"><span class="experience-stat-icon stat-green"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4"/><path d="M5 5c5-4 9 4 14 0v11c-5 4-9-4-14 0"/></svg></span><b>{{ $experienceStats['routes'] }}</b><small>Titik Pemberhentian</small></article>
        <article class="experience-stat-card"><span class="experience-stat-icon stat-orange"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><b>{{ $experienceStats['teams'] }}</b><small>Tim Peserta</small></article>
        <article class="experience-stat-card"><span class="experience-stat-icon stat-blue"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.5-3A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8.5 11h.01m3.5 0h.01m3.5 0h.01"/></svg></span><b>{{ $experienceStats['stories'] }}</b><small>Cerita Tersimpan</small></article>
        <article class="experience-stat-card"><span class="experience-stat-icon stat-gold"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg></span><b>{{ number_format((float) $experienceStats['latestRating'], 1) }}</b><small>Rating Terbaru</small></article>
    </section>

    <section class="experience-latest-panel" aria-label="Cerita terbaru">
        @if($experiences->isNotEmpty())
            @php($latestExperience = $experiences->first())
            @if($latestExperience->media_path)
                <img class="experience-latest-photo" src="{{ $latestExperience->media_url }}" alt="Cerita terbaru dari tim {{ $latestExperience->team->name }}">
            @else
                <div class="experience-latest-placeholder" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 19 9 8l3 6 2-4 6 9H4Z"/><circle cx="17" cy="7" r="2"/></svg></div>
            @endif
            <div class="experience-latest-copy">
                <span>CERITA TERBARU</span>
                <b>{{ $latestExperience->story }}</b>
                <small>— {{ $latestExperience->team->name }}, {{ $latestExperience->user->name }}</small>
                <button type="button" class="text-link share-story" data-team="{{ $latestExperience->team->name }}" data-story="{{ $latestExperience->story }}" data-photo="{{ $latestExperience->media_url }}">Bagikan ke Instagram</button>
            </div>
        @else
            <div class="empty-state">Cerita terbaru akan muncul di sini setelah ada pengalaman dibagikan.</div>
        @endif
    </section>
</div>
@endsection

@push('scripts')
<script>
const storyInput = document.querySelector('[name="story"]');
const storyCount = document.getElementById('story-count');
const photoInput = document.getElementById('experience-photo');
const photoPreview = document.getElementById('photo-preview');
const notice = document.getElementById('experience-notice');
const ratingValue = document.getElementById('experience-rating-value');
const instagram = 'https://www.instagram.com/';

storyInput?.addEventListener('input', () => { storyCount.textContent = String(storyInput.value.length); });
document.querySelectorAll('[name="rating"]').forEach((input) => input.addEventListener('change', () => {
    ratingValue.textContent = Number(input.value).toFixed(1);
}));
photoInput?.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) { photoPreview.hidden = true; return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        notice.textContent = 'Gunakan foto JPG, PNG, atau WEBP maksimal 5 MB.';
        photoInput.value = '';
        photoPreview.hidden = true;
        return;
    }
    photoPreview.src = URL.createObjectURL(file);
    photoPreview.hidden = false;
});

async function shareStory(teamName, story, photoUrl, localFile = null, popup = null) {
    const caption = `Petualangan Jeep bersama tim ${teamName}! ${story}\n\n@jeepadventuregarut\n\n#JeepAdventure #OffroadTeamBuilding #TeamBuilding`;
    let copied = false;
    try { await navigator.clipboard.writeText(caption); copied = true; } catch {}
    if (localFile) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(localFile);
        link.download = `jeep-adventure-story.${localFile.name.split('.').pop() || 'jpg'}`;
        link.click();
        URL.revokeObjectURL(link.href);
    } else if (photoUrl) {
        const link = document.createElement('a');
        link.href = photoUrl;
        link.download = 'jeep-adventure-story';
        link.click();
    }
    if (popup) popup.location.href = instagram;
    else window.open(instagram, '_blank', 'noopener,noreferrer');
    notice.textContent = `${localFile || photoUrl ? 'Foto siap diunduh. ' : ''}${copied ? 'Caption disalin. ' : 'Salin caption secara manual. '}Buat Story di Instagram dan tambahkan stiker Mention @jeepadventuregarut.`;
}

document.getElementById('experience-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const teamName = form.elements.team_id.selectedOptions[0]?.textContent || '';
    const story = form.elements.story.value.trim();
    const localFile = photoInput.files[0] || null;
    const popup = window.open('about:blank', '_blank');
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    notice.textContent = 'Menyimpan pengalaman...';
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
            body: new FormData(form),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || Object.values(payload.errors || {}).flat()[0] || 'Pengalaman gagal disimpan.');
        await shareStory(teamName, story, payload.data.media_url, localFile, popup);
        setTimeout(() => window.location.reload(), 1800);
    } catch (error) {
        popup?.close();
        notice.textContent = error.message || 'Server tidak dapat dihubungi. Coba lagi nanti.';
    } finally {
        button.disabled = false;
    }
});

document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('.experience-card').forEach((card) => {
        card.hidden = button.dataset.filter === 'photo' && card.dataset.hasPhoto !== 'true';
    });
}));

document.querySelectorAll('.share-story').forEach((button) => button.addEventListener('click', () => {
    const popup = window.open('about:blank', '_blank');
    shareStory(button.dataset.team, button.dataset.story, button.dataset.photo, null, popup);
}));
</script>
@endpush
