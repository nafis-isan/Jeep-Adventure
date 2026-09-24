'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerSidebar from '@/components/CustomerSidebar';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

const initialTeams = [
  { initials: 'GA', name: 'Garuda Offroad', members: 5, motto: 'Jelajah tanpa batas!', color: '#2e9d63', total: 0, status: 'approved' as const },
  { initials: 'NA', name: 'Naga Liar', members: 4, motto: 'Bakar semangat, taklukkan medan.', color: '#e8833a', total: 0, status: 'pending' as const },
  { initials: 'EL', name: 'Elang Penjelajah', members: 5, motto: 'Tinggi terbang, dalam mengarungi.', color: '#1d7ce2', total: 0, status: 'approved' as const },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type TeamCard = {
  id?: string;
  initials: string;
  name: string;
  members: number;
  motto: string;
  color: string;
  total: number;
  status: 'pending' | 'approved' | 'rejected';
};

type TeamIconType = 'users' | 'plus' | 'flag' | 'check' | 'clock' | 'xmark';

function TeamIcon({ type }: { type: TeamIconType }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'plus') return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (type === 'flag') return <svg viewBox="0 0 24 24" width="15" height="15" {...common}><path d="M5 21V4M5 5c4-3 7 3 14 0v9c-7 3-10-3-14 0" /></svg>;
  if (type === 'check') return <svg viewBox="0 0 24 24" width="16" height="16" {...common}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.2 2.2 4.8-5" /></svg>;
  if (type === 'clock') return <svg viewBox="0 0 24 24" width="14" height="14" {...common}><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>;
  if (type === 'xmark') return <svg viewBox="0 0 24 24" width="16" height="16" {...common}><circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" /></svg>;
  return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19M15.5 5.5a3 3 0 0 1 0 5.8M16.5 13h.5a4 4 0 0 1 4 4v1" /></svg>;
}

export default function CustomerTeamsPage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [teamList, setTeamList] = useState<TeamCard[]>(initialTeams);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [motto, setMotto] = useState('');
  const [color, setColor] = useState('#2e9d63');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    const loadTeams = async () => {
      try {
        const response = await fetch(`${API_URL}/api/teams`, { credentials: 'include' });
        if (!response.ok) return;

        const payload: { data?: Array<{ id: string; name: string; initials: string; motto: string; status?: string }> } = await response.json();
        if (payload.data) {
          setTeamList(payload.data.map((team, index) => ({
            ...team,
            members: 0,
            color: initialTeams[index % initialTeams.length]?.color || '#59746b',
            total: 0,
            status: (team.status || 'PENDING').toLowerCase() as TeamCard['status'],
          })));
        }
      } catch {
        // Keep fallback
      }
    };

    loadTeams();
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) return null;

  const handleAddTeam = async () => {
    setError('');
    if (!name.trim() || !members.trim() || !motto.trim()) {
      setError('Lengkapi nama tim, jumlah anggota, dan motto.');
      return;
    }

    setSaving(true);
    try {
      const initials = name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
      const response = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), initials, motto: motto.trim(), status: 'pending' }), // Customer mendaftar secara mandiri -> status pending
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Tim gagal didaftarkan');
      if (!payload.data?.id) throw new Error('Respons tim tidak valid');

      setTeamList((current) => [...current, { id: payload.data.id, initials, name: name.trim(), members: Number(members), motto: motto.trim(), color, total: 0, status: 'pending' }]);
      setName('');
      setMembers('');
      setMotto('');
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Tim gagal didaftarkan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell teams-shell" style={styles.appShell}>
      <CustomerSidebar />
      <main className="page-main teams-main" style={styles.mainContent}>
        <div className="mobile-site-header"><Logo light className="mobile-dashboard-logo" /></div>
        <div className="pageHeader" style={styles.pageHeader}>
          <div className="headerBadge" style={styles.headerBadge}><TeamIcon type="users" /> TIM PESERTA</div>
          <h1 className="title" style={styles.title}>Daftar Tim</h1>
          <p className="subtitle" style={styles.subtitle}>Informasi daftar tim yang berpartisipasi dalam petualangan.</p>
        </div>

        {error ? <div style={styles.globalError}>{error}</div> : null}

        <div className="toolbar" style={styles.toolbar}>
          <button type="button" onClick={() => setShowForm((current) => !current)} style={styles.addButton}><TeamIcon type="plus" /> Tambah Tim</button>
        </div>

        {showForm ? (
          <div style={styles.formCard}>
            <div style={styles.formGrid}>
              <label style={styles.formField}>Nama Tim<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Mis. Garuda Offroad" style={styles.formInput} /></label>
              <label style={styles.formField}>Jumlah Anggota<input value={members} onChange={(event) => setMembers(event.target.value)} placeholder="5" type="number" min="1" style={styles.formInput} /></label>
            </div>
            <label style={styles.formField}>Motto / Seruan Tim<input value={motto} onChange={(event) => setMotto(event.target.value)} placeholder="Mis. Jelajah tanpa batas!" style={styles.formInput} /></label>
            <div style={styles.colorRow}><span style={styles.formField}>Warna Identitas</span><div style={styles.swatches}>{['#2e9d63', '#e8833a', '#2868e8', '#9634e8', '#1299b7', '#d69200', '#e52d2d', '#147b73'].map((swatch) => <button type="button" aria-label={`Pilih warna ${swatch}`} key={swatch} onClick={() => setColor(swatch)} style={{ ...styles.swatch, background: swatch, outline: color === swatch ? '2px solid #18352d' : 'none', outlineOffset: 2 }} />)}</div></div>
            <div style={styles.formActions}><button type="button" onClick={handleAddTeam} disabled={saving} style={styles.saveButton}>{saving ? 'Mendaftarkan...' : <><TeamIcon type="plus" /> Daftarkan Tim</>}</button><button type="button" onClick={() => setShowForm(false)} style={styles.cancelButton}>Batal</button></div>
          </div>
        ) : null}

        <div className="teamGrid" style={styles.teamGrid}>
          {teamList.map((team) => {
            const statusConfig = {
              pending: { label: 'Pending', bg: '#fff3cd', color: '#856404', icon: <TeamIcon type="clock" /> },
              approved: { label: 'Approved', bg: '#d4edda', color: '#155724', icon: <TeamIcon type="check" /> },
              rejected: { label: 'Rejected', bg: '#f8d7da', color: '#721c24', icon: <TeamIcon type="xmark" /> },
            }[team.status || 'approved'];

            return (
              <div className="card" key={team.id || team.name} style={styles.card}>
                <div style={{ ...styles.cardTop, background: team.color }}>
                  <div style={styles.initials}>{team.initials}</div>
                  <div style={styles.cardTitleWrap}>
                    <div style={styles.cardTitle}>{team.name}</div>
                    <div style={styles.cardMeta}>{team.members} anggota</div>
                  </div>
                </div>

                <div style={styles.cardSubHeader}>
                  <div style={{ ...styles.statusBadge, background: statusConfig.bg, color: statusConfig.color }}>
                    {statusConfig.icon} <span>{statusConfig.label}</span>
                  </div>
                </div>

                <div style={styles.motto}>“{team.motto}”</div>
                <div style={styles.footerRow}>
                  <div style={styles.inlineMeta}><TeamIcon type="flag" /> 0/6 pos</div>
                  <div style={styles.inlineMeta}><TeamIcon type="check" /> game selesai</div>
                  <div style={styles.totalValue}>{team.total}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appShell: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f2f0ee' },
  mainContent: { flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto', padding: '46px 54px 40px' },
  pageHeader: { marginBottom: 18 },
  headerBadge: { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff0e9', color: '#e6642b', padding: '8px 16px', borderRadius: 999, fontSize: 14, fontWeight: 800, letterSpacing: '0.06em' },
  title: { fontSize: 42, lineHeight: 1.12, margin: '18px 0 10px', letterSpacing: '-0.06em', fontWeight: 900, color: '#1c2a29' },
  subtitle: { fontSize: 17, color: '#4a5855', margin: 0 },
  globalError: { color: '#9c2d22', background: '#fff0ed', border: '1px solid #efc4bd', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  toolbar: { display: 'flex', justifyContent: 'flex-end', marginBottom: 22 },
  addButton: { border: 'none', background: '#123d34', color: '#fff', padding: '16px 24px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
  formCard: { maxWidth: 520, margin: '0 0 22px auto', padding: 22, border: '1px solid #ded8d1', borderRadius: 16, background: '#fffdfa', boxShadow: '0 2px 8px rgba(27,42,37,0.05)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  formField: { display: 'flex', flexDirection: 'column', gap: 7, fontSize: 14, color: '#25312d', marginBottom: 14 },
  formInput: { width: '100%', border: '1px solid #d9d3cb', borderRadius: 10, padding: '11px 12px', fontSize: 14, color: '#25312d', background: '#fffdfa', outline: 'none' },
  colorRow: { marginTop: 4 },
  swatches: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 2 },
  swatch: { width: 26, height: 26, border: 'none', borderRadius: '50%', cursor: 'pointer' },
  formActions: { display: 'flex', gap: 9, alignItems: 'center', marginTop: 2 },
  saveButton: { border: 'none', borderRadius: 9, background: '#285b43', color: '#fff', padding: '10px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 },
  cancelButton: { border: '1px solid #d9d3cb', borderRadius: 9, background: '#fffdfa', color: '#4c4843', padding: '9px 14px', fontSize: 13, cursor: 'pointer' },
  teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(260px, 1fr))', gap: 18 },
  card: { border: '1px solid rgba(17,61,53,0.12)', borderRadius: 18, overflow: 'hidden', background: '#f7f5f3' },
  cardTop: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', color: '#fff' },
  initials: { width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 },
  cardTitleWrap: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 19, fontWeight: 800, marginBottom: 3, lineHeight: 1.2 },
  cardMeta: { fontSize: 16, opacity: 0.95 },
  cardSubHeader: { padding: '10px 14px 0' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 },
  motto: { padding: '12px 14px 10px', fontSize: 16, color: '#3c4b4a', minHeight: 52 },
  footerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0 14px 16px', color: '#384d49', fontSize: 15 },
  inlineMeta: { display: 'flex', alignItems: 'center', gap: 6 },
  totalValue: { fontSize: 32, fontWeight: 800, color: '#1f2a29', minWidth: 32, textAlign: 'right' },
};