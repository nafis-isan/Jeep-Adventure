'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomerSidebar from '@/components/CustomerSidebar';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

const ranking = [
  { name: 'Garuda Offroad', initials: 'GA', color: '#2f9b72', points: 0 },
  { name: 'Naga Liar', initials: 'NA', color: '#d77c2b', points: 0 },
  { name: 'Elang Penjelajah', initials: 'EL', color: '#1d7ce2', points: 0 },
];

function AwardIcon({ type }: { type: 'crown' | 'medal' | 'trophy' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (type === 'crown') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="m4 7 4 4 4-6 4 6 4-4-2 11H6L4 7Z" /><path d="M6 21h12" /></svg>;
  if (type === 'medal') return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="m8 3 4 5 4-5" /><circle cx="12" cy="14" r="5" /><path d="m10 14 1.4 1.4L14.5 12" /></svg>;
  return <svg viewBox="0 0 24 24" width="24" height="24" {...common}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M12 13v4M8 20h8M9 17h6" /></svg>;
}

export default function ScoreboardPage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentRanking, setCurrentRanking] = useState(ranking);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;

    let active = true;
    const loadRanking = async () => {
      try {
        const response = await fetch('/api/leaderboard', { cache: 'no-store' });
        if (!response.ok) return;

        const payload: { data?: Array<{ teamName: string; initials: string; totalPoints: number }> } = await response.json();
        if (!active || !payload.data) return;

        const colors: Record<string, string> = {
          'Garuda Offroad': '#2f9b72',
          'Naga Liar': '#d77c2b',
          'Elang Penjelajah': '#1d7ce2',
        };
        setCurrentRanking(payload.data.map((item) => ({
          name: item.teamName,
          initials: item.initials,
          color: colors[item.teamName] ?? '#59746b',
          points: item.totalPoints,
        })));
      } catch {
        // Keep the last known ranking when a refresh fails.
      }
    };

    loadRanking();
    const refreshTimer = window.setInterval(loadRanking, 5000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [loading, isAuthenticated]);

  if (loading || !isAuthenticated) return null;

  const emptyTeam = { name: 'Belum ada tim', initials: '--', color: '#b8c1bd', points: 0 };
  const podiumRanking = [0, 1, 2].map((index) => currentRanking[index] ?? emptyTeam);
  const leaderboardRows = [currentRanking[1], currentRanking[0], currentRanking[2]].filter(Boolean);

  return (
    <div className="page-shell scoreboard-shell" style={styles.appShell}>
      <CustomerSidebar />
      <main className="page-main scoreboard-main" style={styles.mainContent}>
        <div className="mobile-site-header"><Logo light className="mobile-dashboard-logo" /></div>
        <div className="pageHeader" style={styles.pageHeader}>
          <div className="headerBadge" style={styles.headerBadge}><AwardIcon type="trophy" /> PAPAN SKOR</div>
          <h1 className="title" style={styles.title}>Peringkat Tim</h1>
          <p className="subtitle" style={styles.subtitle}>Peringkat sementara berdasarkan akumulasi skor mini games.</p>
        </div>

        <div className="podiumWrap" style={styles.podiumWrap}>
          <div className="podiumItem podium-second" style={styles.podiumItem}>
            <div className="podiumAvatar" style={{ ...styles.avatar, background: podiumRanking[1].color }}>{podiumRanking[1].initials}</div>
            <div style={styles.teamName}>{podiumRanking[1].name}</div>
            <div style={styles.points}>{podiumRanking[1].points} poin</div>
            <div className="podiumBlock" style={styles.podiumBlock}><span>2</span></div>
          </div>
          <div className="podiumItem podium-first" style={styles.podiumItem}>
            <div className="podiumAvatar" style={{ ...styles.avatar, background: podiumRanking[0].color }}>{podiumRanking[0].initials}</div>
            <div style={styles.teamName}>{podiumRanking[0].name}</div>
            <div style={styles.points}>{podiumRanking[0].points} poin</div>
            <div className="podiumBlock" style={styles.podiumBlock}><span>1</span></div>
          </div>
          <div className="podiumItem podium-third" style={styles.podiumItem}>
            <div className="podiumAvatar" style={{ ...styles.avatar, background: podiumRanking[2].color }}>{podiumRanking[2].initials}</div>
            <div style={styles.teamName}>{podiumRanking[2].name}</div>
            <div style={styles.points}>{podiumRanking[2].points} poin</div>
            <div className="podiumBlock" style={styles.podiumBlock}><span>3</span></div>
          </div>
        </div>

        <div className="listWrap" style={styles.listWrap}>
          {leaderboardRows.map((item, idx) => (
            <div className="listRow" key={item.name} style={styles.listRow}>
              <div className="awardBox" style={{ ...styles.awardBox, color: idx === 0 ? '#fff' : idx === 1 ? '#56616b' : '#fff', background: idx === 0 ? '#ffbd21' : idx === 1 ? '#dce2e7' : '#ff913f' }}>
                <AwardIcon type={idx === 0 ? 'crown' : idx === 1 ? 'medal' : 'trophy'} />
              </div>
              <div style={styles.teamCell}>
                <div style={{ ...styles.avatarSmall, background: item.color }}>{item.initials}</div>
                <div>{item.name}</div>
              </div>
              <div className="scoreProgress" style={styles.scoreProgress}><div style={styles.progressTrack} /><span>0/6 pos</span></div>
              <div style={styles.scoreCell}>{item.points}</div>
            </div>
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
    background: '#f3f1ef',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    height: '100vh',
    overflowY: 'auto',
    padding: '50px 54px 40px',
  },
  pageHeader: {
    textAlign: 'center',
    marginBottom: 30,
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: '#fff0bf',
    border: 'none',
    color: '#c56d12',
    padding: '8px 18px',
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '0.06em',
  },
  title: {
    fontSize: 42,
    margin: '18px 0 8px',
    letterSpacing: '-0.06em',
    fontWeight: 900,
    color: '#1a2c2b',
  },
  subtitle: {
    fontSize: 17,
    color: '#485b58',
    margin: 0,
  },
  podiumWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 24,
    margin: '58px auto 42px',
    maxWidth: 540,
  },
  podiumItem: {
    textAlign: 'center',
    width: 145,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: 30,
    margin: '0 auto 10px',
    border: '4px solid #fff',
    boxShadow: '0 4px 9px rgba(27, 37, 34, 0.13)',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1b2d2b',
    marginBottom: 4,
  },
  points: {
    fontSize: 14,
    color: '#d36f16',
    marginBottom: 10,
  },
  podiumBlock: {
    width: 126,
    height: 122,
    border: '1px solid #e7e2dc',
    borderBottom: 'none',
    borderRadius: '13px 13px 0 0',
    background: 'linear-gradient(#fffefa, #f0eeeb)',
    color: '#bcb8b3',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 14,
    fontSize: 27,
    fontWeight: 800,
  },
  listWrap: {
    maxWidth: 1025,
    margin: '0 auto',
    background: 'transparent',
    borderRadius: 0,
    border: 'none',
    padding: 0,
  },
  listRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    minHeight: 82,
    marginBottom: 12,
    padding: '12px 18px',
    background: '#fffdfa',
    border: '1px solid #e7e1da',
    borderRadius: 16,
  },
  awardBox: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 210,
    fontSize: 18,
    fontWeight: 700,
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: 800,
  },
  scoreCell: {
    width: 120,
    textAlign: 'right',
    fontSize: 20,
    fontWeight: 800,
    color: '#1b2d2b',
  },
  scoreProgress: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#817a73',
    fontSize: 13,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    background: '#eeeae5',
  },
};