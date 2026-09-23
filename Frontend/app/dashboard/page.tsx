'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Logo from '@/components/Logo';

const routeData = [
  { position: 'POS 1', name: 'Pos Garuda', icon: 'target', color: '#e56a00', short: 'Target Challenge', desc: 'Titik pertama untuk mengasah ketepatan. Setiap tim melempar bantuan aman ke sasaran dengan skor berbeda.', id: 'garuda' },
  { position: 'POS 2', name: 'Pos Naga', icon: 'puzzle', color: '#2d67e8', short: 'Puzzle Race', desc: 'Tim harus menyusun puzzle besar untuk membuka petunjuk rute menuju pos berikutnya.', id: 'naga' },
  { position: 'POS 3', name: 'Pos Elang', icon: 'water', color: '#1299b7', short: 'Water Transfer', desc: 'Memanah? Bukan. Memindahkan air dari ember sumber ke ember tujuan menggunakan alat sederhana.', id: 'elang' },
  { position: 'POS 4', name: 'Pos Serigala', icon: 'users', color: '#14a64b', short: 'Relay Challenge', desc: 'Estafet antartangga tim dengan rangkaian tantangan cepat: balap karung, bakiak, dan bawa balon.', id: 'serigala' },
  { position: 'POS 5', name: 'Pos Rajawali', icon: 'camera', color: '#9634e8', short: 'Photo Mission', desc: 'Misi foto: tim mencari dan berfoto di 5 spot sesuai daftar instruksi panitia.', id: 'rajawali' },
  { position: 'POS 6', name: 'Pos Nusantara', icon: 'compass', color: '#d69200', short: 'Treasure Hunt', desc: 'Pos pamungkas: treasure hunt mencari clue tersembunyi yang disiapkan panitia di area perkemahan.', id: 'nusantara' },
];

type RouteIconType = 'target' | 'puzzle' | 'water' | 'users' | 'camera' | 'compass';

function RouteIcon({ type }: { type: RouteIconType }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.1, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (type === 'puzzle') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><path d="M8.5 4.5a2.5 2.5 0 1 1 4.7 1.2h2.3a1.5 1.5 0 0 1 1.5 1.5v2.3a2.5 2.5 0 1 1 1.2 4.7v2.3a1.5 1.5 0 0 1-1.5 1.5h-2.3a2.5 2.5 0 1 1-4.7 1.2H7.4A1.5 1.5 0 0 1 5.9 18v-2.3a2.5 2.5 0 1 1-1.2-4.7V8.7a1.5 1.5 0 0 1 1.5-1.5h2.3a2.5 2.5 0 0 1 0-2.7Z" /></svg>;
  if (type === 'water') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><path d="M12 3.5S6.5 10 6.5 14.3a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5Z" /><path d="M4 7.5c-1.1 1.2-1.5 2.3-1.5 3.4" /></svg>;
  if (type === 'users') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19" /><path d="M15.5 5.5a3 3 0 0 1 0 5.8M16.5 13h.5a4 4 0 0 1 4 4v1" /></svg>;
  if (type === 'camera') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><path d="M4 8.5h3l1.3-2h7.4l1.3 2h3v10H4v-10Z" /><circle cx="12" cy="13.5" r="3" /></svg>;
  if (type === 'compass') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><circle cx="12" cy="12" r="8.5" /><path d="m14.8 9.2-1.6 4-4 1.6 1.6-4 4-1.6Z" /></svg>;
  return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.2" /></svg>;
}

type StatIconType = 'flag' | 'users' | 'game' | 'trophy';

type LeaderboardEntry = {
  teamName: string;
  totalPoints: number;
  completedGames: number;
};

function StatIcon({ type }: { type: StatIconType }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (type === 'flag') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="M5 21V4" /><path d="M5 5c4-3 7 3 14 0v9c-7 3-10-3-14 0" /></svg>;
  if (type === 'users') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19" /><path d="M15.5 5.5a3 3 0 0 1 0 5.8M16.5 13h.5a4 4 0 0 1 4 4v1" /></svg>;
  if (type === 'game') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="M7.5 8h9a4 4 0 0 1 3.8 5.2l-1.4 4.1a2 2 0 0 1-3.5.5L14 16H10l-1.4 1.8a2 2 0 0 1-3.5-.5l-1.4-4.1A4 4 0 0 1 7.5 8Z" /><path d="M7 11v4M5 13h4M16 12h.01M18 14h.01" /></svg>;
  return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M12 13v4M8 20h8M9 17h6" /></svg>;
}

function HeroIcon({ type }: { type: 'sparkle' | 'map' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (type === 'map') return <svg viewBox="0 0 24 24" width="18" height="18" {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></svg>;
  return <svg viewBox="0 0 24 24" width="17" height="17" {...common}><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></svg>;
}

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [leader, setLeader] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    let active = true;
    const loadLeader = async () => {
      try {
        const response = await fetch('/api/leaderboard', { cache: 'no-store' });
        if (!response.ok) return;

        const payload: { data?: LeaderboardEntry[] } = await response.json();
        if (active && payload.data?.[0]) setLeader(payload.data[0]);
      } catch {
        // Keep the last known leader when a refresh fails.
      }
    };

    loadLeader();
    const refreshTimer = window.setInterval(loadLeader, 5000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [loading, isAuthenticated]);

  if (loading || !user) return null;

  return (
    <div className="page-shell dashboard-shell" style={styles.appShell}>
      <Sidebar />
      <main className="page-main dashboard-main" style={styles.mainContent}>
        <div className="mobile-site-header mobile-dashboard-header"><Logo light className="mobile-dashboard-logo" /></div>
        <div className="heroCard" style={styles.heroCard}>
          <div className="badge" style={styles.badge}><HeroIcon type="sparkle" />OFFROAD · TEAM BUILDING · MINI GAMES</div>
          <h1 className="heroTitle" style={styles.heroTitle}>Petualangan Jeep bukan sekadar keliling.</h1>
          <p className="heroText" style={styles.heroText}>
            Rute offroad dengan titik-titik pemberhentian berisi mini games seru — ketepatan, puzzle, estafet, hingga treasure hunt. Jeep + team building dalam satu petualangan.
          </p>
          <div className="buttonRow" style={styles.buttonRow}>
            <Link className="primaryButton" href="/routes" style={styles.primaryButton}><HeroIcon type="map" />Lihat Rute &amp; Games</Link>
            <Link className="secondaryButton" href="/scoreboard" style={styles.secondaryButton}><StatIcon type="trophy" />Papan Skor</Link>
          </div>

          <div className="statGrid" style={styles.statGrid}>
            <div className="statCard" style={styles.statCard}><div className="statIcon" style={{ ...styles.statIcon, color: '#315344' }}><StatIcon type="flag" /></div><div className="statValue" style={styles.statValue}>6</div><div className="statLabel" style={styles.statLabel}>Titik Pemberhentian</div></div>
            <div className="statCard" style={styles.statCard}><div className="statIcon" style={{ ...styles.statIcon, color: '#e66b2b' }}><StatIcon type="users" /></div><div className="statValue" style={styles.statValue}>3</div><div className="statLabel" style={styles.statLabel}>Tim Peserta</div></div>
            <div className="statCard" style={styles.statCard}><div className="statIcon" style={{ ...styles.statIcon, color: '#2768e9' }}><StatIcon type="game" /></div><div className="statValue" style={styles.statValue}>0</div><div className="statLabel" style={styles.statLabel}>Game Selesai</div></div>
            <div className="statCard" style={styles.statCard}><div className="statIcon" style={{ ...styles.statIcon, color: '#d78a00' }}><StatIcon type="trophy" /></div><div className="statValue" style={styles.statValue}>0</div><div className="statLabel" style={styles.statLabel}>Skor Tertinggi</div></div>
          </div>
        </div>

        <div className="sectionHeader" style={styles.sectionHeader}>
          <h2 className="sectionTitle" style={styles.sectionTitle}>Route Petualangan</h2>
          <Link className="linkText" href="/routes" style={styles.linkText}>Semua titik →</Link>
        </div>

        <div className="routeList" style={styles.routeList}>
          {routeData.map((route, index) => (
            <Link className="routeItem" href={`/routes/${route.id}`} key={route.id} style={{ ...styles.routeItem, textDecoration: 'none', color: 'inherit' }}>
              <div className="routeMarkerColumn" style={styles.routeMarkerColumn}>
                <div className="routeBadge" style={{ ...styles.routeBadge, background: route.color }}><RouteIcon type={route.icon as RouteIconType} /></div>
                {index < routeData.length - 1 ? <div className="routeLine" style={styles.routeLine} /> : null}
              </div>
              <div className="routeContent" style={styles.routeContent}>
                <div className="routePosition" style={styles.routePosition}>{route.position}</div>
                <div className="routeTitle" style={styles.routeTitle}>{route.name}</div>
                <div className="routeDesc" style={styles.routeDesc}>{route.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="leaderCard" style={styles.leaderCard}>
          <div className="leaderBadge" style={styles.leaderBadge}><StatIcon type="trophy" /></div>
          <div className="leaderBody" style={styles.leaderBody}>
            <div className="leaderLabel" style={styles.leaderLabel}>PEMUNCAK SEMENTARA</div>
            <div className="leaderName" style={styles.leaderName}>{leader?.teamName ?? 'Memuat...'}</div>
            <div className="leaderMeta" style={styles.leaderMeta}>✓ {leader?.completedGames ?? 0} game selesai · {leader?.totalPoints ?? 0} poin</div>
          </div>
          <Link className="leaderButton" href="/scoreboard" style={styles.leaderButton}>Lihat Papan Skor →</Link>
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
    background: '#f7f5f1',
    color: '#1d2b29',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    height: '100vh',
    overflowY: 'auto',
    padding: '0 52px 48px',
    background: '#f7f5f1',
  },
  heroCard: {
    background: 'linear-gradient(112deg, #123d34 0%, #194534 72%, #313c22 100%)',
    borderRadius: '0 0 0 0',
    margin: '0 -52px',
    padding: '52px 54px 0',
    minHeight: 598,
    color: '#f4f7f6',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#eaf5f1',
    padding: '8px 16px',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '0.06em',
    marginBottom: 28,
  },
  heroTitle: {
    margin: 0,
    maxWidth: 700,
    fontSize: 62,
    lineHeight: 1.02,
    letterSpacing: '-0.045em',
    fontWeight: 900,
  },
  heroText: {
    margin: '22px 0 30px',
    maxWidth: 680,
    fontSize: 20,
    lineHeight: 1.5,
    color: '#e9efed',
  },
  buttonRow: {
    display: 'flex',
    gap: 18,
    flexWrap: 'wrap',
    marginBottom: 28,
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f28a3a',
    color: '#fff',
    borderRadius: 14,
    padding: '16px 28px',
    fontSize: 16,
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 0 rgba(0,0,0,0.06)',
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.08)',
    color: '#f3f5f4',
    borderRadius: 14,
    padding: '16px 28px',
    fontSize: 22,
    fontWeight: 700,
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))',
    gap: 18,
    position: 'relative',
    top: 110,
  },
  statCard: {
    background: '#f5f2ee',
    borderRadius: 17,
    padding: '18px 22px 18px',
    minHeight: 126,
    color: '#1f2d2a',
    boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
  },
  statIcon: {
    fontSize: 26,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 38,
    lineHeight: 1,
    fontWeight: 800,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    color: '#475a57',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 164,
    marginBottom: 14,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 28,
    letterSpacing: '-0.04em',
    fontWeight: 800,
  },
  linkText: {
    color: '#f28a3a',
    textDecoration: 'none',
    fontSize: 20,
    fontWeight: 700,
  },
  routeList: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 24,
  },
  routeItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    minHeight: 108,
  },
  routeMarkerColumn: {
    width: 48,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  routeBadge: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: '50%',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 22,
    boxShadow: '0 2px 4px rgba(25, 37, 32, 0.12)',
  },
  routeLine: {
    width: 1,
    flex: 1,
    minHeight: 58,
    background: '#dedbd5',
  },
  routeContent: {
    flex: 1,
    paddingTop: 1,
    paddingBottom: 22,
  },
  routePosition: {
    color: '#746e68',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.04em',
    marginBottom: 2,
  },
  routeTitle: {
    fontSize: 21,
    fontWeight: 800,
    marginBottom: 4,
    color: '#172522',
  },
  routeDesc: {
    fontSize: 15,
    color: '#4d5a57',
    lineHeight: 1.45,
  },
  leaderCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    background: '#f9f7f4',
    border: '1px solid rgba(17,61,53,0.15)',
    borderRadius: 20,
    marginTop: 28,
    padding: '20px 22px',
  },
  leaderBadge: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: '#123d34',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 30,
  },
  leaderBody: {
    flex: 1,
  },
  leaderLabel: {
    color: '#ea7d44',
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '0.06em',
    marginBottom: 8,
  },
  leaderName: {
    fontSize: 30,
    fontWeight: 700,
    marginBottom: 8,
  },
  leaderMeta: {
    color: '#4e5e5a',
    fontSize: 14,
  },
  leaderButton: {
    background: '#123d34',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 12,
    padding: '18px 28px',
    fontSize: 15,
    fontWeight: 700,
  },
};
