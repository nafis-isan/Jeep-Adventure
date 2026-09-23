import Image from 'next/image';

export default function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 12,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'none',
        }}
      >
        <Image
          src="/images/jeep-adventure-logo.jpeg"
          alt="Jeep Adventure"
          width={58}
          height={58}
          style={{ objectFit: 'contain', borderRadius: 12 }}
        />
      </div>
      <div style={{ lineHeight: 1.12, color: light ? '#f5f7f3' : '#18352d' }}>
        <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.2 }}>Jeep Adventure</div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, opacity: 0.78 }}>OFFROAD TEAM</div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, opacity: 0.78 }}>BUILDING</div>
      </div>
    </div>
  );
}
