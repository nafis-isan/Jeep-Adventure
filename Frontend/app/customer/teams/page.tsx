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

type TeamIconType = 'users' | 'flag' | 'check' | 'clock' | 'xmark';

function TeamIcon({ type }: { type: TeamIconType }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
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

        <div className="teamGrid" style={styles.teamGrid}>
          {teamList.map((team) => {
            return (
              <div className="card" key={team.id || team.name} style={styles.card}>
                <div style={{ ...styles.cardTop, background: team.color }}>
                  <div style={styles.initials}>{team.initials}</div>
                  <div style={styles.cardTitleWrap}>
                    <div style={styles.cardTitle}>{team.name}</div>
                    <div style={styles.cardMeta}>{team.members} anggota</div>
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