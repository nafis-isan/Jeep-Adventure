'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerSidebar from '@/components/CustomerSidebar';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Team = { id: string; name: string; initials: string };
type RouteOption = { id: string; name: string; gameType: string; location?: string };
type Experience = {
  id: string;
  story: string;
  rating: number;
  mediaData?: string | null;
  mediaType?: string | null;
  createdAt: string;
  team: { id: string; name: string; initials: string };
  route: { id: string; name: string; gameType: string };
  user: { id: string; name: string };
};

type IconName = 'send' | 'upload' | 'star' | 'check' | 'flag' | 'users' | 'award';

function Icon({ name }: { name: IconName }) {
  const common = { fill: name === 'star' ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (name === 'send') return <svg viewBox="0 0 24 24" width="16" height="16" {...common}><path d="m4 4 16 8-16 8 3-8-3-8Z" /><path d="M7 12h13" /></svg>;
  if (name === 'upload') return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><path d="M12 16V4M8 8l4-4 4 4M5 15v4h14v-4" /></svg>;
  if (name === 'star') return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></svg>;
  if (name === 'check') return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>;
  if (name === 'flag') return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><path d="M5 21V4M5 5c4-3 7 3 14 0v9c-7 3-10-3-14 0" /></svg>;
  if (name === 'users') return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19M15.5 5.5a3 3 0 0 1 0 5.8M16.5 13h.5a4 4 0 0 1 4 4v1" /></svg>;
  return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M12 13v4M8 20h8M9 17h6" /></svg>;
}

export default function CustomerExperiencePage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [teamId, setTeamId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [rating, setRating] = useState(5);
  const [story, setStory] = useState('');
  const [mediaData, setMediaData] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [filter, setFilter] = useState<'all' | 'photo'>('all');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    const loadPageData = async () => {
      try {
        const [teamsResponse, routesResponse, experiencesResponse] = await Promise.all([
          fetch(`${API_URL}/api/teams`, { credentials: 'include', cache: 'no-store' }),
          fetch(`${API_URL}/api/routes`, { credentials: 'include', cache: 'no-store' }),
          fetch(`${API_URL}/api/experiences`, { credentials: 'include', cache: 'no-store' }),
        ]);
        const teamsPayload: { data?: Team[] } = await teamsResponse.json();
        const routesPayload: { data?: RouteOption[] } = await routesResponse.json();
        const experiencesPayload: { data?: Experience[] } = await experiencesResponse.json();
        const nextTeams = teamsPayload.data ?? [];
        const nextRoutes = routesPayload.data ?? [];
        setTeams(nextTeams);
        setRoutes(nextRoutes);
        setExperiences(experiencesPayload.data ?? []);
        setTeamId(nextTeams[0]?.id ?? '');
        setRouteId(nextRoutes[0]?.id ?? '');
      } catch {
        setNotice('Data belum dapat dimuat. Pastikan backend sedang berjalan.');
      }
    };
    loadPageData();
  }, [loading, isAuthenticated]);

  const selectedRoute = routes.find((route) => route.id === routeId);
  const visibleExperiences = useMemo(() => filter === 'photo' ? experiences.filter((item) => item.mediaData) : experiences, [experiences, filter]);
  const topExperience = experiences[0];

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotice('Gunakan foto JPG, PNG, atau WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotice('Ukuran foto maksimal 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMediaData(String(reader.result));
      setMediaType(file.type);
      setNotice('Foto siap diunggah.');
    };
    reader.readAsDataURL(file);
  };

  const shareToInstagram = async (experience: Experience) => {
    const caption = `Petualangan Jeep bersama tim ${experience.team.name}! ${experience.story}\n\n#JeepAdventure #OffroadTeamBuilding #TeamBuilding`;
    try {
      await navigator.clipboard?.writeText(caption);
    } catch {
      // Clipboard is unavailable on some non-secure Windows origins.
    }
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    setNotice('Cerita tersimpan. Caption disalin jika browser mengizinkan, lalu lanjutkan posting di Instagram.');
  };

  const submitExperience = async (event: FormEvent) => {
    event.preventDefault();
    if (!teamId || !routeId || !story.trim()) {
      setNotice('Pilih tim, rute, dan isi cerita terlebih dahulu.');
      return;
    }
    setSaving(true);
    setNotice('Mengirim pengalaman...');
    try {
      const response = await fetch(`${API_URL}/api/experiences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamId, routeId, rating, story: story.trim(), mediaData: mediaData || undefined, mediaType: mediaType || undefined }),
      });
      const payload: { data?: Experience; message?: string } = await response.json();
      if (!response.ok || !payload.data) {
        setNotice(payload.message || 'Pengalaman gagal dikirim.');
        return;
      }
      setExperiences((current) => [payload.data!, ...current]);
      setStory('');
      setRating(5);
      setMediaData('');
      setMediaType('');
      setNotice('Pengalaman berhasil disimpan ke database.');
      await shareToInstagram(payload.data);
    } catch {
      setNotice('Server tidak dapat dihubungi. Coba lagi nanti.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="page-shell experience-shell" style={styles.appShell}>
      <CustomerSidebar />
      <main className="page-main experience-main" style={styles.mainContent}>
        <div className="mobile-site-header"><Logo light className="mobile-dashboard-logo" /></div>
        <header style={styles.hero}>
          <div style={styles.heroInner}><div style={styles.badge}><span style={{ color: '#e86d3a' }}>✦</span> OFFROAD · TEAM BUILDING · MINI GAMES</div><div style={styles.heroRow}><div><h1 style={styles.heroTitle}>Petualangan Lebih Seru Jika Dibagikan.</h1><p style={styles.heroText}>Dengarkan cerita tim lain, bagikan keseruanmu, dan beri inspirasi untuk petualangan berikutnya.</p></div><div style={styles.eventMeta}><span>⌖ {selectedRoute?.location || selectedRoute?.name || 'Rute aktif'}</span><span>•</span><span style={{ color: '#9ae6b4' }}>✓ Event Aktif</span></div></div></div>
        </header>

        <div style={styles.content}>
          <div style={styles.topGrid}>
            <section style={styles.formCard}><div style={styles.sectionHeading}><div><h2 style={styles.sectionTitle}>Formulir Berbagi Cerita</h2><p style={styles.sectionHint}>Bagikan momen yang paling berkesan dari perjalananmu.</p></div><span style={styles.newBadge}>Post Baru</span></div>
              <form onSubmit={submitExperience}>
                <div style={styles.fieldGrid}><label style={styles.label}>Rute &amp; Game<select value={routeId} onChange={(event) => setRouteId(event.target.value)} style={styles.input}><option value="">Pilih rute</option>{routes.map((route) => <option value={route.id} key={route.id}>{route.name} · {route.gameType}</option>)}</select></label><label style={styles.label}>Nama Tim<select value={teamId} onChange={(event) => setTeamId(event.target.value)} style={styles.input}><option value="">Pilih tim</option>{teams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}</select></label></div>
                <div style={styles.label}>Rating Bintang (1-5)<div style={styles.ratingRow}>{[1, 2, 3, 4, 5].map((value) => <button type="button" aria-label={`Beri rating ${value} dari 5`} key={value} onClick={() => setRating(value)} style={{ ...styles.starButton, color: value <= rating ? '#f59e0b' : '#cbd5e0' }}><Icon name="star" /></button>)}<span style={styles.ratingValue}>{rating.toFixed(1)}</span></div></div>
                <label style={styles.label}>Cerita Keseruan<textarea value={story} onChange={(event) => setStory(event.target.value)} maxLength={280} rows={3} required placeholder="Bagikan keseruanmu di sini..." style={styles.textarea} /></label>
                <div style={styles.formBottom}><label style={styles.uploadButton}><Icon name="upload" /> Unggah<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} hidden /></label>{mediaData ? <img src={mediaData} alt="Preview" style={styles.thumb} /> : <span style={styles.uploadHint}>Foto JPG/PNG/WEBP maksimal 5 MB</span>}<button type="submit" disabled={saving} style={styles.submitButton}>{saving ? 'Mengirim...' : 'Kirim Pengalaman'} <Icon name="send" /></button></div>
                {notice ? <p role="status" style={styles.notice}>{notice}</p> : null}
              </form>
            </section>

            <section style={styles.galleryCard}><div style={styles.sectionHeading}><div style={styles.galleryHeading}><h2 style={styles.sectionTitle}>Galeri Pengalaman Tim</h2><span style={styles.countBadge}>{experiences.length} Item</span></div><div style={styles.tabs}><button type="button" onClick={() => setFilter('all')} style={filter === 'all' ? styles.activeTab : styles.tab}>Semua</button><button type="button" onClick={() => setFilter('photo')} style={filter === 'photo' ? styles.activeTab : styles.tab}>Foto</button></div></div>{visibleExperiences.length === 0 ? <div style={styles.emptyGallery}>Belum ada pengalaman tersimpan di database.</div> : <div style={styles.galleryGrid}>{visibleExperiences.map((item) => <article key={item.id} style={styles.galleryItem}>{item.mediaData ? <img src={item.mediaData} alt="Momen tim" style={styles.galleryImage} /> : <div style={{ ...styles.galleryImage, ...styles.placeholder }}>✦</div>}<div style={styles.galleryBody}><h3 style={styles.galleryTitle}>{item.story}</h3><div style={styles.galleryMeta}><span>{item.team.name}</span><span style={styles.ratingText}>★ {item.rating.toFixed(1)}</span></div><button type="button" onClick={() => shareToInstagram(item)} style={styles.cardShare}>Bagikan</button></div></article>)}</div>}</section>
          </div>

          <div style={styles.bottomGrid}><div style={styles.metricsGrid}><Metric icon="flag" value={routes.length} label="Titik Pemberhentian" /><Metric icon="users" value={teams.length} label="Tim Peserta" /><Metric icon="check" value={experiences.length} label="Cerita Tersimpan" /><Metric icon="award" value={topExperience?.rating.toFixed(1) || '0'} label="Rating Terbaru" /></div><section style={styles.featuredCard}><div style={styles.featuredVisual}>{topExperience?.mediaData ? <img src={topExperience.mediaData} alt="Cerita pilihan" style={styles.featuredImg} /> : <span>✦</span>}</div><div><span style={styles.featuredLabel}>CERITA TERBARU</span><h2 style={styles.featuredTitle}>{topExperience?.story || 'Setiap rute punya cerita yang layak dikenang.'}</h2><p style={styles.featuredText}>{topExperience ? `— ${topExperience.user.name}, ${topExperience.team.name}` : 'Mulai bagikan momen timmu dan tampilkan di sini.'}</p>{topExperience ? <button type="button" onClick={() => shareToInstagram(topExperience)} style={styles.storyButton}>Bagikan ke Instagram</button> : null}</div></section></div>

        </div>
      </main>
    </div>
  );
}

function Metric({ icon, value, label }: { icon: IconName; value: number | string; label: string }) {
  return <div style={styles.metric}><div style={styles.metricIcon}><Icon name={icon} /></div><strong style={styles.metricValue}>{value}</strong><span style={styles.metricLabel}>{label}</span></div>;
}

const styles: Record<string, React.CSSProperties> = {
  appShell: { display: 'flex', minHeight: '100vh', background: '#fbf9f5', color: '#26352f' },
  mainContent: { flex: 1, minWidth: 0, overflowY: 'auto', paddingBottom: 48 },
  hero: { background: '#153828', color: '#fff', padding: '32px 32px 52px', borderRadius: '0 0 38px 38px', boxShadow: '0 8px 24px rgba(15,41,30,.18)' },
  heroInner: { maxWidth: 1180, margin: '0 auto' },
  badge: { display: 'inline-flex', gap: 7, alignItems: 'center', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(154,230,180,.18)', color: '#b8e2c7', fontSize: 11, fontWeight: 800, letterSpacing: '.06em' },
  heroRow: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginTop: 15 },
  heroTitle: { margin: 0, fontSize: 42, lineHeight: 1.08, letterSpacing: '-.045em', fontWeight: 900 },
  heroText: { margin: '10px 0 0', maxWidth: 650, color: '#d3e5d9', fontSize: 14, lineHeight: 1.5 },
  eventMeta: { display: 'flex', gap: 10, flexShrink: 0, color: '#d3e5d9', fontSize: 11 },
  content: { maxWidth: 1180, width: '100%', margin: '-24px auto 0', padding: '0 24px' },
  topGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)', gap: 18 },
  formCard: { background: '#fff', border: '1px solid #e9e4d8', borderRadius: 22, padding: 22, boxShadow: '0 12px 26px rgba(15,41,30,.06)' },
  galleryCard: { background: '#fff', border: '1px solid #e9e4d8', borderRadius: 22, padding: 22, boxShadow: '0 12px 26px rgba(15,41,30,.06)' },
  sectionHeading: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  sectionTitle: { margin: 0, color: '#0f291e', fontSize: 18, fontWeight: 900, letterSpacing: '-.02em' },
  sectionHint: { margin: '5px 0 0', color: '#7a857d', fontSize: 12 },
  newBadge: { background: '#e6efea', color: '#1c4a35', borderRadius: 999, padding: '6px 10px', fontSize: 10, fontWeight: 800 },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, color: '#3e4a44', fontSize: 11, fontWeight: 800 },
  input: { width: '100%', border: '1px solid #e9e4d8', borderRadius: 10, padding: '10px 11px', background: '#fbf9f5', color: '#2d3748', fontSize: 12, outline: 'none' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 2 },
  starButton: { display: 'inline-flex', border: 0, background: 'transparent', padding: 1, cursor: 'pointer' },
  ratingValue: { marginLeft: 6, color: '#6b7280', fontSize: 12, fontWeight: 800 },
  textarea: { resize: 'none', width: '100%', border: '1px solid #e9e4d8', borderRadius: 10, padding: 11, background: '#fbf9f5', color: '#2d3748', fontFamily: 'inherit', fontSize: 12, outline: 'none' },
  formBottom: { display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 },
  uploadButton: { display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid #ddd5c4', borderRadius: 10, padding: '9px 11px', background: '#f4f1ea', color: '#153828', fontSize: 11, fontWeight: 800, cursor: 'pointer' },
  uploadHint: { flex: 1, color: '#9ca3af', fontSize: 10 },
  thumb: { width: 36, height: 36, borderRadius: 8, objectFit: 'cover' },
  submitButton: { display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto', border: 0, borderRadius: 10, padding: '10px 13px', background: '#153828', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' },
  notice: { margin: '12px 0 0', color: '#2e7053', fontSize: 11 },
  galleryHeading: { display: 'flex', alignItems: 'center', gap: 8 },
  countBadge: { borderRadius: 999, padding: '4px 8px', background: '#f4f1ea', color: '#153828', fontSize: 10, fontWeight: 800 },
  tabs: { display: 'flex', gap: 3, padding: 3, borderRadius: 9, background: '#fbf9f5' },
  tab: { border: 0, borderRadius: 7, padding: '6px 8px', background: 'transparent', color: '#7a857d', fontSize: 10, cursor: 'pointer' },
  activeTab: { border: 0, borderRadius: 7, padding: '6px 8px', background: '#fff', color: '#153828', fontSize: 10, fontWeight: 800, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 },
  galleryItem: { overflow: 'hidden', border: '1px solid #e9e4d8', borderRadius: 14, background: '#fbf9f5' },
  galleryImage: { display: 'block', width: '100%', height: 120, objectFit: 'cover' },
  placeholder: { display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#d5e6d9,#4c805f)', color: '#fff', fontSize: 28 },
  galleryBody: { padding: 10 },
  galleryTitle: { margin: 0, overflow: 'hidden', color: '#0f291e', fontSize: 11, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  galleryMeta: { display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 8, color: '#7a857d', fontSize: 10 },
  ratingText: { color: '#e86d3a', fontWeight: 800 },
  cardShare: { marginTop: 8, border: 0, padding: 0, background: 'transparent', color: '#e86d3a', fontSize: 10, fontWeight: 800, cursor: 'pointer' },
  emptyGallery: { display: 'grid', placeItems: 'center', minHeight: 180, border: '1px dashed #ddd5c4', borderRadius: 14, color: '#89938c', fontSize: 12 },
  bottomGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)', gap: 18, marginTop: 18 },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  metric: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 118, padding: 15, border: '1px solid #e9e4d8', borderRadius: 16, background: '#fff', boxShadow: '0 8px 18px rgba(15,41,30,.04)' },
  metricIcon: { display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 10, background: '#e6efea', color: '#153828' },
  metricValue: { color: '#0f291e', fontSize: 25, fontWeight: 900 },
  metricLabel: { color: '#7a857d', fontSize: 10, fontWeight: 700 },
  featuredCard: { display: 'grid', gridTemplateColumns: 'minmax(130px, .9fr) 1fr', gap: 16, alignItems: 'center', padding: 16, border: '1px solid #e9e4d8', borderRadius: 18, background: '#fff', boxShadow: '0 8px 18px rgba(15,41,30,.04)' },
  featuredVisual: { display: 'grid', placeItems: 'center', minHeight: 135, overflow: 'hidden', borderRadius: 13, background: 'linear-gradient(135deg,#a9c6a9,#2e7053)', color: '#fff', fontSize: 28 },
  featuredImg: { width: '100%', height: 135, objectFit: 'cover' },
  featuredLabel: { color: '#e86d3a', fontSize: 10, fontWeight: 900, letterSpacing: '.08em' },
  featuredTitle: { margin: '7px 0 6px', color: '#0f291e', fontSize: 15, lineHeight: 1.3 },
  featuredText: { margin: 0, color: '#7a857d', fontSize: 11 },
  storyButton: { marginTop: 12, border: 0, background: 'transparent', color: '#e86d3a', fontSize: 11, fontWeight: 800, cursor: 'pointer' },
  routesCard: { marginTop: 18, padding: 20, border: '1px solid #e9e4d8', borderRadius: 18, background: '#fff' },
  routeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  routeItem: { display: 'flex', gap: 10, padding: 12, border: '1px solid #e9e4d8', borderRadius: 12, background: '#fbf9f5' },
  routeDot: { width: 10, height: 10, marginTop: 3, flexShrink: 0, borderRadius: '50%' },
  routePosition: { color: '#e86d3a', fontSize: 9, fontWeight: 900 },
  routeName: { margin: '3px 0 0', color: '#0f291e', fontSize: 12 },
  routeDescription: { margin: '3px 0 0', color: '#7a857d', fontSize: 10 },
};
