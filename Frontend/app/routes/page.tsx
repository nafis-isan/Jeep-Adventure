'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

type RouteIconType = 'target' | 'puzzle' | 'water' | 'users' | 'camera' | 'compass';

const routes = [
  { id: 'garuda', position: 'POS 1', name: 'Pos Garuda', title: 'Target Challenge', color: '#f28a3a', description: 'Titik pertama untuk mengasah ketepatan. Setiap tim melempar bantuan aman ke sasaran dengan skor berbeda.', code: 'Pos Garuda', icon: 'target', duration: 15 },
  { id: 'naga', position: 'POS 2', name: 'Pos Naga', title: 'Puzzle Race', color: '#3b82f6', description: 'Tim harus menyusun puzzle besar untuk membuka petunjuk rute menuju pos berikutnya.', code: 'Pos Naga', icon: 'puzzle', duration: 15 },
  { id: 'elang', position: 'POS 3', name: 'Pos Elang', title: 'Water Transfer', color: '#10b9d0', description: 'Memanah? Bukan. Memindahkan air dari ember sumber ke ember tujuan menggunakan alat sederhana.', code: 'Pos Elang', icon: 'water', duration: 15 },
  { id: 'serigala', position: 'POS 4', name: 'Pos Serigala', title: 'Relay Challenge', color: '#2fbf77', description: 'Estafet antartangga tim dengan rangkaian tantangan cepat: balap karung, bakiak, dan bawa balon.', code: 'Pos Serigala', icon: 'users', duration: 15 },
  { id: 'rajawali', position: 'POS 5', name: 'Pos Rajawali', title: 'Photo Mission', color: '#9a4ee0', description: 'Misi foto: tim mencari dan berfoto di 5 spot sesuai daftar instruksi pantia.', code: 'Pos Rajawali', icon: 'camera', duration: 15 },
  { id: 'nusantara', position: 'POS 6', name: 'Pos Nusantara', title: 'Treasure Hunt', color: '#d99b32', description: 'Pos pamungkas: treasure hunt mencari clue tersembunyi yang disiapkan panitia di area perkemahan.', code: 'Pos Nusantara', icon: 'compass', duration: 15 },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const defaultRouteColors: Record<number, string> = {
  1: '#f28a3a',
  2: '#3b82f6',
  3: '#10b9d0',
  4: '#2fbf77',
  5: '#9a4ee0',
  6: '#d99b32',
};

type BackendRoute = {
  id: string;
  position: number;
  name: string;
  gameType: string;
  description: string;
  location: string;
  duration: number;
  color?: string;
};

function RouteIcon({ type }: { type: RouteIconType }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (type === 'puzzle') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="M8.5 4.5a2.5 2.5 0 1 1 4.7 1.2h2.3a1.5 1.5 0 0 1 1.5 1.5v2.3a2.5 2.5 0 1 1 1.2 4.7v2.3a1.5 1.5 0 0 1-1.5 1.5h-2.3a2.5 2.5 0 1 1-4.7 1.2H7.4A1.5 1.5 0 0 1 5.9 18v-2.3a2.5 2.5 0 1 1-1.2-4.7V8.7a1.5 1.5 0 0 1 1.5-1.5h2.3a2.5 2.5 0 0 1 0-2.7Z" /></svg>;
  if (type === 'water') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="M12 3.5S6.5 10 6.5 14.3a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5Z" /><path d="M4 7.5c-1.1 1.2-1.5 2.3-1.5 3.4" /></svg>;
  if (type === 'users') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19" /><path d="M15.5 5.5a3 3 0 0 1 0 5.8M16.5 13h.5a4 4 0 0 1 4 4v1" /></svg>;
  if (type === 'camera') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="M4 8.5h3l1.3-2h7.4l1.3 2h3v10H4v-10Z" /><circle cx="12" cy="13.5" r="3" /></svg>;
  if (type === 'compass') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><circle cx="12" cy="12" r="8.5" /><path d="m14.8 9.2-1.6 4-4 1.6 1.6-4 4-1.6Z" /></svg>;
  return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.2" /></svg>;
}

export default function RoutesPage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [routeCards, setRouteCards] = useState(routes);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [gameType, setGameType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('15');
  const [difficulty, setDifficulty] = useState('Mudah');
  const [color, setColor] = useState('#147b73');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    fetch(`${API_URL}/api/routes`, { cache: 'force-cache', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return;
        const payload: { data?: BackendRoute[] } = await response.json();
        setRouteCards((current) => current.map((card) => {
          const savedRoute = payload.data?.find((item) => item.position === Number(card.position.replace('POS ', '')));
          const position = savedRoute?.position ?? Number(card.position.replace('POS ', ''));
          return savedRoute ? {
            ...card,
            id: savedRoute.id,
            name: savedRoute.name,
            title: savedRoute.gameType,
            description: savedRoute.description,
            code: savedRoute.location,
            duration: savedRoute.duration,
            color: defaultRouteColors[position] || savedRoute.color || card.color,
          } : card;
        }));
      })
      .catch(() => undefined);
  }, [loading, isAuthenticated]);

  const handleAddRoute = async () => {
    setError('');
    if (!name.trim() || !gameType.trim() || !description.trim() || !location.trim() || !duration.trim()) {
      setError('Lengkapi semua data pos terlebih dahulu.');
      return;
    }

    setSaving(true);
    try {
      const nextPosition = Math.max(0, ...routeCards.map((route) => Number(route.position.replace('POS ', '')))) + 1;
      const response = await fetch(`${API_URL}/api/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ position: nextPosition, name: name.trim(), gameType: gameType.trim(), description: description.trim(), location: location.trim(), duration: Number(duration), difficulty, color }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Pos gagal ditambahkan');

      const newRoute = payload.data;
      setRouteCards((current) => [...current, {
        id: newRoute.id,
        position: `POS ${newRoute.position}`,
        name: newRoute.name,
        title: newRoute.gameType,
        color: newRoute.color || color,
        description: newRoute.description,
        code: newRoute.location,
        icon: 'compass',
        duration: newRoute.duration,
      }]);
      setName('');
      setGameType('');
      setDescription('');
      setLocation('');
      setDuration('15');
      setDifficulty('Mudah');
      setColor('#147b73');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pos gagal ditambahkan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async (route: (typeof routeCards)[number]) => {
    if (!route.id || !window.confirm(`Hapus ${route.name}?`)) return;

    setError('');
    setDeleting(route.id);
    try {
      const response = await fetch(`${API_URL}/api/routes/${route.id}`, { method: 'DELETE', credentials: 'include' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Pos gagal dihapus');
      setRouteCards((current) => current.filter((item) => item.id !== route.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pos gagal dihapus');
    } finally {
      setDeleting(null);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="page-shell routes-shell" style={styles.appShell}>
      <Sidebar />
      <main className="page-main routes-main" style={styles.mainContent}>
        <div className="mobile-site-header"><Logo light className="mobile-dashboard-logo" /></div>
        <div className="pageHeader" style={styles.pageHeader}>
          <div className="headerBadge" style={styles.headerBadge}>📍 RUTE PETUALANGAN</div>
          <h1 className="title" style={styles.title}>Titik Pemberhentian &amp; Mini Games</h1>
          <p className="subtitle" style={styles.subtitle}>Setiap pos sepanjang rute jeep menyimpan satu mini game. Buka titik untuk membaca instruksi dan mencatat skor tim.</p>
        </div>

        {error ? <div style={styles.globalError}>{error}</div> : null}
        <div style={styles.toolbar}><button type="button" onClick={() => setShowForm((current) => !current)} style={styles.addButton}>＋ Tambah Pos</button></div>

        {showForm ? <div style={styles.modalBackdrop} role="presentation"><div style={styles.formCard} role="dialog" aria-modal="true" aria-labelledby="add-route-title"><div style={styles.modalHeader}><h2 id="add-route-title" style={styles.modalTitle}>Tambah Pos &amp; Mini Game</h2><button type="button" onClick={() => setShowForm(false)} aria-label="Tutup form tambah pos" style={styles.closeButton}>×</button></div><div style={styles.formGrid}><label style={styles.formField}>Nama Pos<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Mis. Pos Merapi" style={styles.formInput} /></label><label style={styles.formField}>Jenis Game<input value={gameType} onChange={(event) => setGameType(event.target.value)} placeholder="Mis. Team Puzzle" style={styles.formInput} /></label></div><label style={styles.formField}>Deskripsi<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Jelaskan tantangan di pos ini" style={styles.formTextarea} /></label><div style={styles.formGrid}><label style={styles.formField}>Lokasi<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Mis. Hutan Pinus" style={styles.formInput} /></label><label style={styles.formField}>Durasi (menit)<input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} style={styles.formInput} /></label></div><label style={styles.formField}>Kesulitan<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} style={styles.formInput}><option>Mudah</option><option>Sedang</option><option>Sulit</option></select></label><div style={styles.formField}>Warna Pos<div style={styles.swatches}>{['#e86d3a', '#2563eb', '#0f9bb4', '#16a34a', '#9333ea', '#d99100', '#147b73', '#374151'].map((swatch) => <button type="button" key={swatch} aria-label={`Pilih warna ${swatch}`} onClick={() => setColor(swatch)} style={{ ...styles.swatch, background: swatch, outline: color === swatch ? '3px solid #18352d' : 'none', outlineOffset: 2 }} />)}</div></div><div style={styles.formActions}><button type="button" onClick={handleAddRoute} disabled={saving} style={styles.saveButton}>{saving ? 'Menyimpan...' : 'Simpan Pos'}</button><button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>Batal</button></div></div></div> : null}

        <div className="list" style={styles.list}>
          {routeCards.map((route) => (
            <Link className="card" href={`/fasilitator/routes/${route.id}`} key={route.position} style={{ ...styles.card, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ ...styles.leftStrip, background: route.color }}>
                <div style={styles.posIcon}><RouteIcon type={route.icon as RouteIconType} /></div>
                <div style={styles.posNumber}>{route.position.replace('POS ', '')}</div>
              </div>
              <div className="cardBody" style={styles.cardBody}>
                <div style={{ ...styles.gameTag, background: route.color }}>{route.title}</div>
                <div className="name" style={styles.name}>{route.name}</div>
                <div className="description" style={styles.description}>{route.description}</div>
                <div style={styles.metaRow}>
                  <span style={styles.metaPill}>⏱️ {route.duration ?? 15} menit</span>
                  <span style={styles.metaPill}>📍 {route.code}</span>
                </div>
              </div>
              <div style={styles.cardActions}><div style={styles.chevron}>›</div><button type="button" aria-label={`Hapus ${route.name}`} title={`Hapus ${route.name}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); handleDeleteRoute(route); }} disabled={!route.id || deleting === route.id} style={styles.deleteButton}>🗑</button></div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appShell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: '#f3f2f0',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    height: '100vh',
    overflowY: 'auto',
    padding: '46px 54px 60px',
  },
  pageHeader: {
    marginBottom: 28,
  },
  headerBadge: {
    display: 'inline-block',
    background: '#edf1ee',
    border: '1px solid rgba(17,61,53,0.12)',
    color: '#1c3d38',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
    padding: '8px 16px',
    letterSpacing: '0.06em',
  },
  title: {
    fontSize: 42,
    lineHeight: 1.1,
    margin: '20px 0 12px',
    letterSpacing: '-0.06em',
    fontWeight: 900,
    color: '#111827',
  },
  subtitle: {
    margin: 0,
    maxWidth: 820,
    fontSize: 17,
    color: '#4a5855',
    lineHeight: 1.5,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  card: {
    display: 'flex',
    alignItems: 'stretch',
    background: '#f7f5f3',
    border: '1px solid rgba(17,61,53,0.12)',
    borderRadius: 18,
    overflow: 'hidden',
    minHeight: 180,
  },
  leftStrip: {
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#fff',
    fontSize: 23,
    fontWeight: 900,
  },
  posIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  posNumber: {
    lineHeight: 1,
  },
  cardBody: {
    flex: 1,
    padding: '22px 24px',
  },
  gameTag: {
    display: 'inline-block',
    color: '#0e2e2d',
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '-0.04em',
    marginBottom: 10,
    color: '#1b2624',
  },
  description: {
    fontSize: 16,
    color: '#495a56',
    lineHeight: 1.6,
    maxWidth: 820,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    flexWrap: 'wrap',
  },
  metaPill: {
    background: '#eaf0ef',
    color: '#2e403d',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
    padding: '6px 10px',
  },
  chevron: {
    width: 54,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 38,
    color: '#1c2c2a',
    fontWeight: 300,
  },
  globalError: { color: '#9c2d22', background: '#fff0ed', border: '1px solid #efc4bd', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 12 },
  toolbar: { display: 'flex', justifyContent: 'flex-end', marginBottom: 18 },
  addButton: { border: 0, borderRadius: 11, padding: '12px 17px', background: '#123d34', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' },
  modalBackdrop: { position: 'fixed', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(20,35,31,.42)' },
  formCard: { width: 'min(560px, 100%)', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', padding: 22, border: '1px solid #ded8d1', borderRadius: 16, background: '#fffdfa', boxShadow: '0 18px 50px rgba(27,42,37,.22)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  modalTitle: { margin: 0, color: '#18352d', fontSize: 20, fontWeight: 900 },
  closeButton: { border: 0, background: 'transparent', color: '#69756e', fontSize: 26, cursor: 'pointer' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formField: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 13, color: '#45544d', fontSize: 12, fontWeight: 800 },
  formInput: { border: '1px solid #d9dfd9', borderRadius: 9, padding: '10px 11px', background: '#fff', color: '#25332d', fontSize: 13 },
  formTextarea: { minHeight: 78, resize: 'vertical', border: '1px solid #d9dfd9', borderRadius: 9, padding: '10px 11px', background: '#fff', color: '#25332d', fontFamily: 'inherit', fontSize: 13 },
  swatches: { display: 'flex', flexWrap: 'wrap', gap: 10, paddingTop: 3 },
  swatch: { width: 27, height: 27, border: 0, borderRadius: '50%', cursor: 'pointer' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 8 },
  saveButton: { border: 0, borderRadius: 9, padding: '10px 15px', background: '#123d34', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' },
  cancelButton: { border: '1px solid #d9dfd9', borderRadius: 9, padding: '10px 15px', background: '#fff', color: '#45544d', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  cardActions: { display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 8px 8px 0' },
  deleteButton: { width: 32, height: 32, border: 0, borderRadius: 9, background: '#fff0ed', color: '#b5483e', cursor: 'pointer', fontSize: 15 },
};
