'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

type RouteIconType = 'target' | 'puzzle' | 'water' | 'users' | 'camera' | 'compass';

const routes = [
  { id: 'garuda', position: 'POS 1', name: 'Pos Garuda', title: 'Target Challenge', color: '#f28a3a', description: 'Titik pertama untuk mengasah ketepatan. Setiap tim melempar bantuan aman ke sasaran dengan skor berbeda.', code: 'Pos Garuda', icon: 'target' },
  { id: 'naga', position: 'POS 2', name: 'Pos Naga', title: 'Puzzle Race', color: '#3b82f6', description: 'Tim harus menyusun puzzle besar untuk membuka petunjuk rute menuju pos berikutnya.', code: 'Pos Naga', icon: 'puzzle' },
  { id: 'elang', position: 'POS 3', name: 'Pos Elang', title: 'Water Transfer', color: '#10b9d0', description: 'Memanah? Bukan. Memindahkan air dari ember sumber ke ember tujuan menggunakan alat sederhana.', code: 'Pos Elang', icon: 'water' },
  { id: 'serigala', position: 'POS 4', name: 'Pos Serigala', title: 'Relay Challenge', color: '#2fbf77', description: 'Estafet antartangga tim dengan rangkaian tantangan cepat: balap karung, bakiak, dan bawa balon.', code: 'Pos Serigala', icon: 'users' },
  { id: 'rajawali', position: 'POS 5', name: 'Pos Rajawali', title: 'Photo Mission', color: '#9a4ee0', description: 'Misi foto: tim mencari dan berfoto di 5 spot sesuai daftar instruksi pantai.', code: 'Pos Rajawali', icon: 'camera' },
  { id: 'nusantara', position: 'POS 6', name: 'Pos Nusantara', title: 'Treasure Hunt', color: '#d99b32', description: 'Pos pamungkas: treasure hunt mencari clue tersembunyi yang disiapkan panitia di area perkemahan.', code: 'Pos Nusantara', icon: 'compass' },
];

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

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

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

        <div className="list" style={styles.list}>
          {routes.map((route) => (
            <Link className="card" href={`/routes/${route.id}`} key={route.position} style={{ ...styles.card, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ ...styles.leftStrip, background: route.color }}>
                <div style={styles.posIcon}><RouteIcon type={route.icon as RouteIconType} /></div>
                <div style={styles.posNumber}>{route.position.replace('POS ', '')}</div>
              </div>
              <div className="cardBody" style={styles.cardBody}>
                <div style={{ ...styles.gameTag, background: route.color }}>{route.title}</div>
                <div className="name" style={styles.name}>{route.name}</div>
                <div className="description" style={styles.description}>{route.description}</div>
                <div style={styles.metaRow}>
                  <span style={styles.metaPill}>⏱️ 15 menit</span>
                  <span style={styles.metaPill}>📍 {route.code}</span>
                </div>
              </div>
              <div style={styles.chevron}>›</div>
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
};
