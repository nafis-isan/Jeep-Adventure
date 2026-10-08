@extends('layouts.app')

@section('title', 'Bagikan Pengalaman')

@section('content')
<section class="experience-hero">
    <span class="eyebrow">CERITA PETUALANGAN</span>
    <h1>Petualangan lebih seru jika dibagikan.</h1>
    <p>Dengarkan cerita tim lain, bagikan keseruanmu, dan beri inspirasi untuk petualangan berikutnya.</p>
</section>
<div class="experience-layout">
    <section class="panel experience-form-panel">
        <span class="eyebrow">POST BARU</span><h2>Formulir berbagi cerita</h2>
        <p class="muted">Bagikan momen yang paling berkesan dari perjalananmu.</p>
        <form id="experience-form" method="post" action="{{ route('experiences.store') }}" enctype="multipart/form-data" class="form-stack">@csrf
            <label>Rute &amp; game<select name="route_id" required><option value="">Pilih rute</option>@foreach($routes as $route)<option value="{{ $route->id }}">{{ $route->name }} · {{ $route->game_type }}</option>@endforeach</select></label>
            <label>Nama tim<select name="team_id" required><option value="">Pilih tim</option>@foreach($teams as $team)<option value="{{ $team->id }}">{{ $team->name }}</option>@endforeach</select></label>
            <label>Rating bintang <span class="muted">1–5</span><select name="rating" required><option value="5">★★★★★ · 5</option><option value="4">★★★★☆ · 4</option><option value="3">★★★☆☆ · 3</option><option value="2">★★☆☆☆ · 2</option><option value="1">★☆☆☆☆ · 1</option></select></label>
            <label>Cerita keseruan<textarea name="story" rows="4" maxlength="280" required placeholder="Bagikan keseruanmu di sini..."></textarea><small class="muted"><span id="story-count">0</span>/280 karakter</small></label>
            <label class="upload-control">Foto (opsional) <small class="muted">JPG, PNG, WEBP · maks 5 MB</small><input id="experience-photo" type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>
            <img id="photo-preview" class="photo-preview" alt="Pratinjau foto" hidden>
            <button class="button primary" type="submit">Kirim pengalaman <span>→</span></button>
            <p id="experience-notice" class="muted" role="status"></p>
        </form>
    </section>
    <section class="gallery-section">
        <div class="section-heading"><div><span class="eyebrow">KISAH TIM</span><h2>Galeri pengalaman</h2></div><span class="count-pill">{{ $experiences->count() }} cerita</span></div>
        <div class="filter-row"><button class="filter-button active" type="button" data-filter="all">Semua</button><button class="filter-button" type="button" data-filter="photo">Foto</button></div>
        <div class="experience-grid">
            @forelse($experiences as $experience)
                <article class="experience-card" data-has-photo="{{ $experience->media_path ? 'true' : 'false' }}">
                    @if($experience->media_path)<img class="experience-photo" src="{{ $experience->media_url }}" alt="Momen tim {{ $experience->team->name }}">@else<div class="experience-placeholder">✦</div>@endif
                    <div class="experience-card-body"><div class="experience-card-meta"><span>{{ $experience->team->name }} · {{ $experience->route->name }}</span><b>★ {{ number_format($experience->rating, 1) }}</b></div>
                        <p>{{ $experience->story }}</p><small>Oleh {{ $experience->user->name }} · {{ $experience->created_at->format('d M Y') }}</small>
                        <button type="button" class="text-link share-story" data-team="{{ $experience->team->name }}" data-story="{{ $experience->story }}" data-photo="{{ $experience->media_url }}">Bagikan cerita →</button>
                    </div>
                </article>
            @empty
                <div class="empty-state">Belum ada pengalaman tersimpan. Jadilah yang pertama membagikan cerita!</div>
            @endforelse
        </div>
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
const instagram = 'https://www.instagram.com/';

storyInput?.addEventListener('input', () => { storyCount.textContent = String(storyInput.value.length); });
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
