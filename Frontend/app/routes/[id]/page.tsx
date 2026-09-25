'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const routeDetails: Record<string, {
  position: string;
  name: string;
  gameType: string;
  color: string;
  location: string;
  duration: number;
  maxPoints: number;
  description: string;
  instruction: string;
}> = {
  garuda: {
    position: 'POS 1', name: 'Pos Garuda', gameType: 'Target Challenge', color: '#e56a00', location: 'Bukit Pasir', duration: 10, maxPoints: 100,
    description: 'Titik pertama untuk mengasah ketepatan. Setiap tim melempar bantuan aman ke sasaran dengan skor berbeda.',
    instruction: 'Setiap anggota tim melempar 5 kali peluru ringan (bola karet) ke sasaran bertingkat (10, 20, 50 poin). Skor dihitung dari total tembusan. Pelaksanaan aman, jarak lempar 5 meter.',
  },
  naga: {
    position: 'POS 2', name: 'Pos Naga', gameType: 'Puzzle Race', color: '#2d67e8', location: 'Hutan Pinus', duration: 15, maxPoints: 100,
    description: 'Tim harus menyusun puzzle besar untuk membuka petunjuk rute menuju pos berikutnya.',
    instruction: 'Panitia memberi kotak berisi keping puzzle (gambar peta rute). Tim menyusun hingga utuh untuk mendapat kartu petunjuk berikutnya. Bantuan panitia mengurangi 10 poin per bantuan. Waktu maksimal 15 menit.',
  },
  elang: {
    position: 'POS 3', name: 'Pos Elang', gameType: 'Water Transfer', color: '#1299b7', location: 'Mata Air', duration: 12, maxPoints: 100,
    description: 'Memanah? Bukan. Memindahkan air dari ember sumber ke ember tujuan menggunakan alat sederhana.',
    instruction: 'Tim diberi 1 spons besar dan 2 ember. Pindahkan air dari ember sumber ke ember tujuan sejauh 8 meter dalam 12 menit. Skor = (liter air pindah / 5 liter) x 100. Bekerja bergantian, tidak boleh lari.',
  },
  serigala: {
    position: 'POS 4', name: 'Pos Serigala', gameType: 'Relay Challenge', color: '#14a64b', location: 'Lapangan Jeep', duration: 8, maxPoints: 100,
    description: 'Estafet antaranggota tim dengan rangkaian tantangan cepat: balap karung, bakiak, dan bawa balon.',
    instruction: '4 anggota bergantian: (1) balap karung 20m, (2) bakiak bambu 15m, (3) bawa balon di antara dada tanpa tangan 10m, (4) lari gawang 20m. Estafet dengan tos tangan. Skor berdasarkan waktu: <3 menit = 100, <4 menit = 80, <5 menit = 60.',
  },
  rajawali: {
    position: 'POS 5', name: 'Pos Rajawali', gameType: 'Photo Mission', color: '#9634e8', location: 'Pantai Petualang', duration: 20, maxPoints: 100,
    description: 'Misi foto: tim mencari dan berfoto di 5 spot sesuai daftar instruksi panitia.',
    instruction: 'Temukan lima spot sesuai daftar, lalu ambil foto bersama tim sebagai bukti penyelesaian misi. Waktu 20 menit per tim.',
  },
  nusantara: {
    position: 'POS 6', name: 'Pos Nusantara', gameType: 'Treasure Hunt', color: '#d69200', location: 'Area Perkemahan', duration: 25, maxPoints: 100,
    description: 'Pos pamungkas: treasure hunt mencari clue tersembunyi yang disiapkan panitia.',
    instruction: 'Ikuti petunjuk yang ditemukan di setiap titik sampai mendapatkan harta karun terakhir. Waktu 25 menit per tim.',
  },
};

type Team = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

type BackendRoute = {
  id: string;
  position: number;
};

type Score = {
  id: string;
  teamId: string;
  routeId: string;
  points: number;
  completed: boolean;
  note?: string | null;
  photoData?: string | null;
};

function DetailIcon({ type }: { type: 'target' | 'pin' | 'clock' | 'check' | 'upload' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'pin') return <svg viewBox="0 0 24 24" width="18" height="18" {...common}><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></svg>;
  if (type === 'clock') return <svg viewBox="0 0 24 24" width="18" height="18" {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>;
  if (type === 'check') return <svg viewBox="0 0 24 24" width="18" height="18" {...common}><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>;
  if (type === 'upload') return <svg viewBox="0 0 24 24" width="18" height="18" {...common}><path d="M4 5h16v14H4z" /><path d="m8 15 2.5-3 2 2 2-2.5L20 17" /><circle cx="9" cy="9" r="1" /></svg>;
  return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.2" /></svg>;
}

export default function RouteDetailPage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const route = routeDetails[params.id] ?? routeDetails.garuda;
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [routeId, setRouteId] = useState('');
  const [score, setScore] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [completed, setCompleted] = useState(false);
  const [checkedInTeams, setCheckedInTeams] = useState<string[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    const loadTeams = async () => {
      try {
        const [teamsResponse, routesResponse] = await Promise.all([
          fetch(`${API_URL}/api/teams`, { cache: 'no-store', credentials: 'include' }),
          fetch(`${API_URL}/api/routes`, { cache: 'no-store', credentials: 'include' }),
        ]);
        if (!teamsResponse.ok || !routesResponse.ok) return;

        const payload: { data?: Array<{ id: string; name: string; initials: string }> } = await teamsResponse.json();
        const routesPayload: { data?: BackendRoute[] } = await routesResponse.json();
        const currentRoute = routesPayload.data?.find((item) => item.position === Number(route.position.replace('POS ', '')));
        setRouteId(currentRoute?.id || '');
        if (currentRoute) {
          const [checkinsResponse, scoresResponse] = await Promise.all([
            fetch(`${API_URL}/api/checkins?routeId=${currentRoute.id}`, { cache: 'no-store', credentials: 'include' }),
            fetch(`${API_URL}/api/scores?routeId=${currentRoute.id}`, { cache: 'no-store', credentials: 'include' }),
          ]);
          if (checkinsResponse.ok) {
            const checkinsPayload: { data?: Array<{ teamId: string }> } = await checkinsResponse.json();
            setCheckedInTeams((checkinsPayload.data ?? []).map((item) => item.teamId));
          }
          if (scoresResponse.ok) {
            const scoresPayload: { data?: Score[] } = await scoresResponse.json();
            setScores(scoresPayload.data ?? []);
          }
        }
        const colors: Record<string, string> = {
          'Garuda Offroad': '#3f7543',
          'Naga Liar': '#e56a00',
          'Elang Penjelajah': '#2d67e8',
        };
        setTeams((payload.data ?? []).map((team) => ({
          ...team,
          color: colors[team.name] ?? '#59746b',
        })));
      } catch {
        setTeams([]);
      }
    };

    loadTeams();
  }, [loading, isAuthenticated]);

  const toggleCheckIn = async (teamId: string) => {
    if (!routeId) return;
    const checked = checkedInTeams.includes(teamId);
    const url = `${API_URL}/api/checkins?teamId=${teamId}&routeId=${routeId}`;
    const response = await fetch(url, {
      method: checked ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: checked ? undefined : JSON.stringify({ teamId, routeId }),
    });
    if (response.ok) {
      setCheckedInTeams((current) => checked ? current.filter((id) => id !== teamId) : [...current, teamId]);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedPhoto = event.target.files?.[0];
    if (!selectedPhoto) return;

    setPhoto(selectedPhoto);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(selectedPhoto);
  };

  const handleSaveScore = async () => {
    if (!selectedTeam || !routeId || !score.trim() || !isScoreValid) {
      setSaveMessage('Pilih tim dan isi skor terlebih dahulu.');
      return;
    }
    if (!checkedInTeams.includes(selectedTeam)) {
      setSaveMessage('Tim harus check-in terlebih dahulu sebelum mengisi skor.');
      setSelectedTeam('');
      return;
    }
    if (scores.some((item) => item.teamId === selectedTeam)) {
      setSaveMessage('Skor tim ini sudah tersimpan dan tidak dapat diisi dua kali.');
      setSelectedTeam('');
      return;
    }
    if (!completed) {
      setSaveMessage('Ubah status menjadi Sudah Selesai sebelum menyimpan skor.');
      return;
    }
    setSaving(true);
    setSaveMessage('');
    try {
      const response = await fetch(`${API_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teamId: selectedTeam,
          routeId,
          points: Number(score),
          completed,
          note,
          photoData: photoPreview || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Skor gagal disimpan');

      setSaveMessage('Skor berhasil disimpan.');
      setScore('');
      setNote('');
      setPhoto(null);
      setPhotoPreview('');
      const scoresResponse = await fetch(`${API_URL}/api/scores?routeId=${routeId}`, { cache: 'no-store', credentials: 'include' });
      if (scoresResponse.ok) setScores((await scoresResponse.json()).data ?? []);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Skor gagal disimpan');
    } finally {
      setSaving(false);
    }
  };

  const isScoreValid = score.trim() !== '' && Number.isFinite(Number(score)) && Number(score) >= 0 && Number(score) <= route.maxPoints;
  const selectedTeamHasScore = scores.some((item) => item.teamId === selectedTeam);
  const canSaveScore = Boolean(selectedTeam && routeId && isScoreValid && completed && checkedInTeams.includes(selectedTeam) && !selectedTeamHasScore && !saving);

  if (loading || !isAuthenticated) return null;

  return (
    <div className="page-shell route-detail-shell" style={styles.appShell}>
      <Sidebar />
      <main className="page-main route-detail-main" style={styles.mainContent}>
        <div className="mobile-site-header"><Logo light className="mobile-dashboard-logo" /></div>
        <section className="route-detail-hero" style={{ ...styles.hero, background: route.color }}>
          <Link className="route-detail-back" href="/fasilitator/routes" style={styles.backLink}>← Route</Link>
          <div style={styles.heroTitleRow}>
            <div className="route-detail-hero-icon" style={styles.heroIcon}><DetailIcon type="target" /></div>
            <div><div className="route-detail-position" style={styles.position}>{route.position}</div><h1 className="route-detail-title" style={styles.title}>{route.name}</h1></div>
          </div>
          <div className="route-detail-meta" style={styles.heroMeta}>
            <span className="route-detail-game-pill" style={styles.gamePill}><DetailIcon type="target" /> {route.gameType}</span>
            <span><DetailIcon type="pin" /> {route.location}</span>
            <span><DetailIcon type="clock" /> {route.duration} menit</span>
            <span><DetailIcon type="target" /> Maks {route.maxPoints} poin</span>
          </div>
        </section>

        <div className="route-detail-content" style={styles.contentGrid}>
          <section>
            <h2 className="route-detail-section-title" style={styles.sectionTitle}>Tentang Mini Game</h2>
            <p className="route-detail-description" style={styles.description}>{route.description}</p>
            <div className="route-detail-card" style={styles.instructionCard}>
              <h3 className="route-detail-card-title" style={styles.cardTitle}><span style={{ ...styles.smallIcon, color: route.color }}><DetailIcon type="target" /></span> Instruksi Permainan</h3>
              <p className="route-detail-card-text" style={styles.cardText}>{route.instruction} Waktu {route.duration} menit per tim.</p>
            </div>
            <div className="route-detail-checkin-card" style={styles.checkinCard}>
              <div style={styles.checkinHeader}><h3 className="route-detail-card-title" style={styles.cardTitle}><span style={styles.smallIcon}><DetailIcon type="check" /></span> Check-in Tim</h3><strong>{checkedInTeams.length}/{teams.length}</strong></div>
              <p className="route-detail-muted" style={styles.muted}>Tim tap check-in saat tiba di pos ini.</p>
              {teams.map((team) => {
                const isCheckedIn = checkedInTeams.includes(team.id);
                const teamScore = scores.find((item) => item.teamId === team.id);
                return <div className="route-detail-team-row" style={isCheckedIn ? styles.teamRowChecked : styles.teamRow} key={team.id}><span style={{ ...styles.teamDot, background: team.color }} /><div className="route-detail-team-info" style={styles.teamInfo}><strong>{team.name}</strong>{isCheckedIn ? <small><DetailIcon type="check" /> Check-in tersimpan{teamScore ? ` · ${teamScore.points} poin` : ''}</small> : null}{teamScore?.photoData ? <img src={teamScore.photoData} alt={`Bukti ${team.name}`} style={styles.teamPhoto} /> : null}</div><button className={isCheckedIn ? 'route-detail-present' : 'route-detail-checkin-button'} type="button" onClick={() => toggleCheckIn(team.id)} style={isCheckedIn ? styles.present : styles.checkinButton}>{isCheckedIn ? 'Hadir' : <><DetailIcon type="check" /> Check-in</>}</button></div>;
              })}
            </div>
            <h2 className="route-detail-results-title" style={styles.resultsTitle}>Hasil Titik Ini</h2>
            {scores.length > 0 ? (
              <div style={styles.resultsList}>
                {scores.map((item) => (
                  <div className="route-detail-result-row" style={styles.resultRow} key={item.id}>
                    <div style={styles.resultHeader}>
                      <strong>{teams.find((team) => team.id === item.teamId)?.name || 'Tim tidak dikenal'}</strong>
                      <strong style={styles.resultPoints}>{item.points} poin</strong>
                    </div>
                    <div style={styles.resultMeta}><DetailIcon type="check" /> {item.completed ? 'Game selesai' : 'Belum selesai'}</div>
                    {item.note ? <div style={styles.resultNote}>{item.note}</div> : null}
                    {item.photoData ? <img src={item.photoData} alt={`Bukti ${teams.find((team) => team.id === item.teamId)?.name || 'tim'}`} style={styles.resultPhoto} /> : null}
                  </div>
                ))}
              </div>
            ) : <div className="route-detail-empty-results" style={styles.emptyResults}>Belum ada skor tercatat di titik ini.</div>}
          </section>

          <aside className="route-detail-score-card" style={styles.scoreCard}>
            <h2 className="route-detail-score-title" style={styles.scoreTitle}>Catat Skor Tim</h2>
            <p className="route-detail-muted" style={styles.muted}>Pilih tim, masukkan skor, dan unggah foto bukti.</p>
            <div className="route-detail-field-grid" style={styles.fieldGrid}>
              <label className="route-detail-label" style={styles.label}>Pilih Tim<select className="route-detail-input" value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)} style={styles.input}><option value="">Pilih tim yang sudah check-in</option>{teams.map((team) => { const isCheckedIn = checkedInTeams.includes(team.id); const hasScore = scores.some((item) => item.teamId === team.id); return <option key={team.id} value={team.id} disabled={!isCheckedIn || hasScore}>{team.name}{hasScore ? ' (Skor tersimpan)' : !isCheckedIn ? ' (Belum check-in)' : ''}</option>; })}</select></label>
              <label className="route-detail-label" style={styles.label}>Skor (maks {route.maxPoints})<input className="route-detail-input" type="number" min="0" max={route.maxPoints} value={score} onChange={(event) => setScore(event.target.value)} style={styles.input} /></label>
            </div>
            <label className="route-detail-label" style={styles.label}>Foto Bukti (opsional)
              <span className="route-detail-upload" style={styles.uploadButton}><DetailIcon type="upload" /> {photo ? 'Ganti Foto' : 'Unggah Foto'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={styles.fileInput} />
              </span>
              {photoPreview ? <img src={photoPreview} alt={`Preview bukti ${photo?.name || ''}`} style={styles.photoPreview} /> : null}
              {photo ? <span style={styles.photoName}>{photo.name}</span> : null}
            </label>
            <label className="route-detail-label" style={styles.label}>Catatan Panitia<textarea className="route-detail-textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Catatan performa tim, pelanggaran, dll." style={styles.textarea} /></label>
            <button className="route-detail-complete" type="button" onClick={() => setCompleted((value) => !value)} style={completed ? { ...styles.completeButton, color: '#fff', background: '#2d9b61' } : styles.completeButton}><DetailIcon type="check" /> {completed ? 'Sudah Selesai' : 'Belum Selesai'}</button>
            {saveMessage ? <div style={styles.saveMessage}>{saveMessage}</div> : null}
            <button className="route-detail-save" type="button" onClick={handleSaveScore} disabled={!canSaveScore} style={canSaveScore ? styles.readySaveButton : styles.saveButton}>{saving ? 'Menyimpan...' : 'Simpan Skor'}</button>
          </aside>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appShell: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f7f5f2', color: '#202b29' },
  mainContent: { flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' },
  hero: { color: '#fff', padding: '28px 54px 32px', minHeight: 245 },
  backLink: { display: 'inline-block', color: '#fff', textDecoration: 'none', fontSize: 16, marginBottom: 26 },
  heroTitleRow: { display: 'flex', alignItems: 'center', gap: 14 },
  heroIcon: { width: 54, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)' },
  position: { fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.9 },
  title: { margin: '4px 0 0', fontSize: 38, lineHeight: 1.05, letterSpacing: '-0.04em', fontWeight: 900 },
  heroMeta: { display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', marginTop: 28, fontSize: 16 },
  gamePill: { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff4e8', color: '#c95d0a', borderRadius: 999, padding: '7px 13px', fontWeight: 700 },
  contentGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 390px', gap: 34, padding: '38px 54px 60px', maxWidth: 1240 },
  sectionTitle: { margin: '0 0 12px', fontSize: 23, fontWeight: 800 },
  description: { margin: '0 0 26px', color: '#6b625b', fontSize: 17, lineHeight: 1.6 },
  instructionCard: { background: '#fffdfb', border: '1px solid #e1dbd4', borderRadius: 17, padding: 22, marginBottom: 26 },
  cardTitle: { display: 'flex', alignItems: 'center', gap: 9, margin: 0, fontSize: 19, fontWeight: 800 },
  smallIcon: { width: 30, height: 30, borderRadius: '50%', background: '#fff5e9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  cardText: { margin: '20px 0 0', color: '#766d65', fontSize: 16, lineHeight: 1.55 },
  checkinCard: { background: '#fffdfb', border: '1px solid #e1dbd4', borderRadius: 17, padding: 22 },
  checkinHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  muted: { margin: '10px 0 20px', color: '#8a8179', fontSize: 15 },
  teamRow: { display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #bcefd1', background: '#f5fff8', borderRadius: 13, padding: '12px 14px', marginTop: 10 },
  teamRowChecked: { display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #bcefd1', background: '#f5fff8', borderRadius: 13, padding: '12px 14px', marginTop: 10 },
  teamDot: { width: 13, height: 13, borderRadius: '50%', flexShrink: 0 },
  teamInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15 },
  teamPhoto: { display: 'block', width: 120, maxHeight: 80, objectFit: 'cover', borderRadius: 8, marginTop: 6 },
  present: { color: '#218b57', background: '#d9f8e5', borderRadius: 999, padding: '6px 11px', fontSize: 13, fontWeight: 700 },
  checkinButton: { display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 10, background: '#285b43', color: '#fff', padding: '10px 13px', cursor: 'pointer', fontSize: 14, fontWeight: 700 },
  resultsTitle: { margin: '28px 0 14px', fontSize: 23, fontWeight: 800 },
  emptyResults: { minHeight: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #e1dbd4', borderRadius: 17, color: '#8a8179', fontSize: 15, background: '#fffdfb' },
  resultsList: { display: 'grid', gap: 12 },
  resultRow: { border: '1px solid #e1dbd4', borderRadius: 14, padding: '14px 16px', background: '#fffdfb' },
  resultHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, color: '#202b29', fontSize: 16 },
  resultPoints: { color: '#d36f16', whiteSpace: 'nowrap' },
  resultMeta: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#357052', fontSize: 13, fontWeight: 600 },
  resultNote: { marginTop: 8, color: '#766d65', fontSize: 14, lineHeight: 1.45 },
  resultPhoto: { display: 'block', width: 140, maxHeight: 100, objectFit: 'cover', borderRadius: 9, marginTop: 10 },
  scoreCard: { alignSelf: 'start', position: 'sticky', top: 24, background: '#fffdfb', border: '1px solid #e1dbd4', borderRadius: 17, padding: 22, boxShadow: '0 2px 8px rgba(39,35,30,0.04)' },
  scoreTitle: { margin: 0, fontSize: 20, fontWeight: 800 },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  label: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18, fontSize: 14, fontWeight: 600, color: '#393632' },
  input: { width: '100%', boxSizing: 'border-box', border: '1px solid #e0dad3', borderRadius: 11, padding: '13px 12px', background: '#fffdfb', color: '#514a44', fontSize: 15 },
  uploadButton: { alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #e0dad3', borderRadius: 11, background: '#fffdfb', color: '#554d47', padding: '11px 14px', cursor: 'pointer', fontSize: 14 },
  fileInput: { position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' },
  photoPreview: { display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 11, marginTop: 10, border: '1px solid #e0dad3' },
  photoName: { color: '#766d65', fontSize: 12, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  textarea: { width: '100%', minHeight: 76, boxSizing: 'border-box', resize: 'vertical', border: '1px solid #e0dad3', borderRadius: 11, padding: 12, background: '#fffdfb', color: '#514a44', fontSize: 14 },
  completeButton: { display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #73e5a4', borderRadius: 11, background: '#f2fff7', color: '#29945b', padding: '12px 14px', cursor: 'pointer', marginTop: 18, fontSize: 14, fontWeight: 700 },
  saveMessage: { marginTop: 12, color: '#357052', fontSize: 13, fontWeight: 600 },
  saveButton: { display: 'block', border: 'none', borderRadius: 11, background: '#9aaea3', color: '#fff', padding: '13px 18px', marginTop: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  readySaveButton: { display: 'block', border: 'none', borderRadius: 11, background: '#2d9b61', color: '#fff', padding: '13px 18px', marginTop: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};
