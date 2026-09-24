'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

const navItems = [
  { label: 'Dashboard', href: '/fasilitator/dashboard', icon: 'dashboard' },
  { label: 'Route & Games', href: '/fasilitator/routes', icon: 'map' },
  { label: 'Tim', href: '/fasilitator/teams', icon: 'users' },
  { label: 'Papan Skor', href: '/fasilitator/scoreboard', icon: 'trophy' },
];

type SidebarIconType = 'dashboard' | 'map' | 'users' | 'trophy' | 'logout';

function SidebarIcon({ type }: { type: SidebarIconType }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (type === 'map') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15M15 6v15" /></svg>;
  if (type === 'users') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19" /><path d="M15.5 5.5a3 3 0 0 1 0 5.8M16.5 13h.5a4 4 0 0 1 4 4v1" /></svg>;
  if (type === 'trophy') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M12 13v4M8 20h8M9 17h6" /></svg>;
  if (type === 'logout') return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></svg>;
  return <svg viewBox="0 0 24 24" width="22" height="22" {...common}><path d="m4 16 4-8 4 3 4-7 4 12" /><path d="M4 20h16" /></svg>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside
      className="app-sidebar"
      style={{
        width: 284,
        flexShrink: 0,
        background: '#113d35',
        color: '#eff3f2',
        padding: '22px 14px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        boxSizing: 'border-box',
      }}
    >
      <div>
        <div className="sidebar-brand" style={{ padding: '10px 8px 18px' }}>
          <Logo light />
        </div>

        <nav className="sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div className={`sidebar-nav-item${active ? ' is-active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                    padding: '12px 15px',
                    margin: '1px 0',
                    borderRadius: 15,
                    color: active ? '#f6f4f0' : '#b8c4bd',
                    background: active ? 'rgba(78,124,99,0.28)' : 'transparent',
                    fontSize: 16,
                    fontWeight: 500,
                    boxShadow: 'none',
                  }}
                >
                  <span style={{ width: 23, height: 23, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><SidebarIcon type={item.icon as SidebarIconType} /></span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 8px 4px' }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#e3efe7',
              color: '#0d2f2b',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            {user?.name?.slice(0, 2).toUpperCase() || 'NI'}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>
            <div>{user?.name || 'Nafis Ikhsan'}</div>
            <div style={{ fontSize: 12, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
              {user?.email || 'nafisikhsanofficial@gmail.com'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            color: '#dfe8e4',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '18px 8px 6px',
            cursor: 'pointer',
            fontSize: 17,
            textAlign: 'left',
            fontWeight: 500,
          }}
        >
          <SidebarIcon type="logout" />
          <span>Keluar</span>
        </button>

        <div style={{ paddingTop: 8, fontSize: 11, color: '#a9c2ba', wordBreak: 'break-all' }}>
          https://jeep-quest-go.base.app
        </div>
      </div>
    </aside>
  );
}