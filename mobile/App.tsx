import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { AdventureRoute, ApiEnvelope, Experience, LeaderboardEntry, LOGO_URL, request, saveToken, getToken, clearToken, Team, User } from './src/api';

type Tab = 'home' | 'routes' | 'teams' | 'scores' | 'experiences';
type PickedPhoto = { uri: string; base64: string; mimeType: string };
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Beranda', icon: '⌂' },
  { id: 'routes', label: 'Rute', icon: '⌖' },
  { id: 'teams', label: 'Tim', icon: '♧' },
  { id: 'scores', label: 'Skor', icon: '♜' },
  { id: 'experiences', label: 'Cerita', icon: '✦' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [selectedRoute, setSelectedRoute] = useState<AdventureRoute | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [routes, setRoutes] = useState<AdventureRoute[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loadData = async (accessToken: string) => {
    const [teamResponse, routeResponse, scoreResponse, experienceResponse] = await Promise.all([
      request<ApiEnvelope<Team[]>>('/teams', accessToken),
      request<ApiEnvelope<AdventureRoute[]>>('/routes', accessToken),
      request<ApiEnvelope<LeaderboardEntry[]>>('/leaderboard', accessToken),
      request<ApiEnvelope<Experience[]>>('/experiences', accessToken),
    ]);
    setTeams(teamResponse.data);
    setRoutes(routeResponse.data);
    setLeaderboard(scoreResponse.data);
    setExperiences(experienceResponse.data);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedToken = await getToken();
        if (savedToken) {
          const profile = await request<{ user: User }>('/auth/me', savedToken);
          setToken(savedToken);
          setUser(profile.user);
          await loadData(savedToken);
        }
      } catch (loadError) {
        await clearToken();
        setError(loadError instanceof Error ? loadError.message : 'Sesi tidak dapat dimuat.');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const refresh = async () => {
    if (!token) return;
    setRefreshing(true);
    setError('');
    try {
      await loadData(token);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Data gagal dimuat.');
    } finally {
      setRefreshing(false);
    }
  };

  const login = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await request<{ token: string; user: User }>('/auth/login', null, {
        method: 'POST',
        body: { email: email.trim(), password },
      });
      await saveToken(result.token);
      setToken(result.token);
      setUser(result.user);
      await loadData(result.token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) await request('/auth/logout', token, { method: 'POST' });
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Logout gagal.');
      return;
    }
    await clearToken();
    setToken(null);
    setUser(null);
    setSelectedRoute(null);
  };

  const perform = async (action: () => Promise<void>) => {
    setError('');
    setNotice('');
    try {
      await action();
      await refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Aksi gagal diproses.');
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.green} /><Text style={styles.muted}>Memuat Jeep Adventure...</Text></View>;
  }

  if (!user || !token) {
    return (
      <View style={styles.loginPage}>
        <StatusBar style="dark" />
        <View style={styles.loginCard}>
          <Brand />
          <Text style={styles.eyebrow}>OFFROAD · TEAM BUILDING · MINI GAMES</Text>
          <Text style={styles.loginTitle}>Welcome back</Text>
          <Text style={styles.muted}>Masuk untuk melanjutkan petualanganmu.</Text>
          {error ? <Notice text={error} kind="error" /> : null}
          <Field label="Email"><TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" /></Field>
          <Field label="Password"><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimal 8 karakter" /></Field>
          <Button title="Masuk ke akun  →" onPress={login} />
          <Text style={styles.loginFoot}>Petualangan dimulai dari sini.</Text>
        </View>
      </View>
    );
  }

  const isFacilitator = user.role === 'FACILITATOR';

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <Brand light />
        <Pressable onPress={logout}><Text style={styles.topBarAction}>Keluar</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.greeting}>
          <View><Text style={styles.eyebrow}>JEEP ADVENTURE · {isFacilitator ? 'FASILITATOR' : 'CUSTOMER'}</Text><Text style={styles.greetingTitle}>Halo, {user.name.split(' ')[0]}!</Text></View>
          <Pressable onPress={refresh}><Text style={styles.refresh}>{refreshing ? 'Memuat…' : '↻ Perbarui'}</Text></Pressable>
        </View>
        {error ? <Notice text={error} kind="error" /> : null}
        {notice ? <Notice text={notice} kind="success" /> : null}
        {selectedRoute ? (
          <RouteDetail key={selectedRoute.id} route={selectedRoute} token={token} teams={teams} isFacilitator={isFacilitator} onBack={() => setSelectedRoute(null)} onSave={perform} onNotice={setNotice} />
        ) : (
          <>
            {tab === 'home' && <Dashboard routes={routes} teams={teams} leaderboard={leaderboard} onOpenRoute={setSelectedRoute} />}
            {tab === 'routes' && <RoutesScreen routes={routes} onOpen={setSelectedRoute} />}
            {tab === 'teams' && <TeamsScreen teams={teams} token={token} isFacilitator={isFacilitator} onSave={perform} />}
            {tab === 'scores' && <ScoresScreen leaderboard={leaderboard} />}
            {tab === 'experiences' && (isFacilitator
              ? <Notice text="Galeri pengalaman tersedia untuk akun customer." kind="info" />
              : <ExperiencesScreen experiences={experiences} teams={teams} routes={routes} token={token} onSave={perform} onNotice={setNotice} />)}
          </>
        )}
      </ScrollView>
      {!selectedRoute && (
        <View style={styles.tabBar}>
          {tabs.filter((item) => !isFacilitator || item.id !== 'experiences').map((item) => (
            <Pressable key={item.id} style={styles.tabButton} onPress={() => { setSelectedRoute(null); setTab(item.id); setError(''); }}>
              <Text style={[styles.tabIcon, tab === item.id && styles.tabActive]}>{item.icon}</Text>
              <Text style={[styles.tabLabel, tab === item.id && styles.tabActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return <View style={styles.brand}><Image source={{ uri: LOGO_URL }} style={styles.brandMark} /><Text style={[styles.brandText, light && styles.brandTextLight]}>JEEP <Text style={styles.brandAdventure}>ADVENTURE</Text></Text></View>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text>{children}</View>;
}

function Button({ title, onPress, secondary = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.buttonSecondary, disabled && styles.buttonDisabled]}><Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text></Pressable>;
}

function Notice({ text, kind }: { text: string; kind: 'error' | 'success' | 'info' }) {
  return <View style={[styles.notice, kind === 'error' ? styles.noticeError : kind === 'success' ? styles.noticeSuccess : styles.noticeInfo]}><Text style={styles.noticeText}>{text}</Text></View>;
}

function SectionHeading({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return <View style={styles.sectionHeading}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.sectionTitle}>{title}</Text></View>;
}

function Dashboard({ routes, teams, leaderboard, onOpenRoute }: { routes: AdventureRoute[]; teams: Team[]; leaderboard: LeaderboardEntry[]; onOpenRoute: (route: AdventureRoute) => void }) {
  return <>
    <View style={styles.hero}>
      <Text style={styles.heroEyebrow}>OFFROAD · TEAM BUILDING · MINI GAMES</Text>
      <Text style={styles.heroTitle}>Petualangan seru dimulai di sini.</Text>
      <Text style={styles.heroText}>Jelajahi setiap pos, tantang kekompakan tim, dan kumpulkan cerita di sepanjang perjalanan.</Text>
      <Text style={styles.heroAccent}>✦ ADVENTURE AWAITS</Text>
    </View>
    <View style={styles.statGrid}>
      <Stat label="Tim peserta" value={teams.length} icon="♧" />
      <Stat label="Titik petualangan" value={routes.length} icon="⌖" />
      <Stat label="Game selesai" value={leaderboard.reduce((total, team) => total + team.completedGames, 0)} icon="✓" />
      <Stat label="Total poin" value={leaderboard.reduce((total, team) => total + team.totalPoints, 0)} icon="♜" />
    </View>
    <SectionHeading title="Route & Games" eyebrow="JALUR PETUALANGAN" />
    <View style={styles.stack}>{routes.slice(0, 3).map((route) => <RouteCard key={route.id} route={route} onPress={() => onOpenRoute(route)} />)}{!routes.length && <Empty text="Rute petualangan belum tersedia." />}</View>
    <SectionHeading title="Papan skor terbaru" eyebrow="PERFORMA TIM" />
    <View style={styles.card}>{leaderboard.slice(0, 3).map((entry, index) => <LeaderboardRow key={entry.teamId} entry={entry} rank={index + 1} />)}{!leaderboard.length && <Empty text="Skor akan muncul setelah permainan selesai." />}</View>
  </>;
}

function Stat({ label, value, icon }: { label: string; value: number; icon: string }) {
  return <View style={styles.statCard}><Text style={styles.statIcon}>{icon}</Text><Text style={styles.statValue}>{value.toLocaleString()}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function RoutesScreen({ routes, onOpen }: { routes: AdventureRoute[]; onOpen: (route: AdventureRoute) => void }) {
  return <><SectionHeading title="Route & Games" eyebrow="JALUR PETUALANGAN" /><Text style={styles.bodyText}>Pilih pos untuk melihat detail tantangan dan progres tim.</Text><View style={styles.stack}>{routes.map((route) => <RouteCard key={route.id} route={route} onPress={() => onOpen(route)} />)}{!routes.length && <Empty text="Belum ada rute petualangan." />}</View></>;
}

function RouteCard({ route, onPress }: { route: AdventureRoute; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.routeCard}><View style={styles.rowBetween}><Text style={styles.routePosition}>POS {String(route.position).padStart(2, '0')}</Text><Text style={styles.routeDifficulty}>{route.difficulty}</Text></View><Text style={styles.cardTitle}>{route.name}</Text><Text style={styles.muted}>{route.game_type}</Text><Text style={styles.routeMeta}>⌖ {route.location}  ·  {route.duration} menit</Text><View style={styles.rowBetween}><Text style={styles.muted}>Maks. {route.max_points} poin</Text><Text style={styles.linkText}>Lihat detail →</Text></View></Pressable>;
}

function RouteDetail({ route, token, teams, isFacilitator, onBack, onSave, onNotice }: {
  route: AdventureRoute;
  token: string;
  teams: Team[];
  isFacilitator: boolean;
  onBack: () => void;
  onSave: (action: () => Promise<void>) => Promise<void>;
  onNotice: (message: string) => void;
}) {
  const [checkIns, setCheckIns] = useState<{ id: string; team_id: string; team: Team }[]>([]);
  const [scores, setScores] = useState<{ id: string; points: number; team: Team; note?: string }[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [points, setPoints] = useState('');
  const [note, setNote] = useState('');
  const [scorePhoto, setScorePhoto] = useState<PickedPhoto | null>(null);
  const [mediaPermission, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();
  const [draftName, setDraftName] = useState(route.name);
  const [draftInstruction, setDraftInstruction] = useState(route.instruction);

  const loadRouteProgress = async () => {
    const [checkinResponse, scoreResponse] = await Promise.all([
      request<ApiEnvelope<{ id: string; team_id: string; team: Team }[]>>(`/checkins?route_id=${route.id}`, token),
      request<ApiEnvelope<{ id: string; points: number; team: Team; note?: string }[]>>(`/scores?route_id=${route.id}`, token),
    ]);
    setCheckIns(checkinResponse.data);
    setScores(scoreResponse.data);
  };
  useEffect(() => { loadRouteProgress().catch((loadError) => onNotice(loadError instanceof Error ? loadError.message : 'Progres pos gagal dimuat.')); }, [route.id]);

  const checkInTeam = (teamId: string) => onSave(async () => {
    await request('/checkins', token, { method: 'POST', body: { team_id: teamId, route_id: route.id } });
    await loadRouteProgress();
    onNotice('Check-in tim berhasil dicatat.');
  });
  const saveScore = () => onSave(async () => {
    await request('/scores', token, { method: 'POST', body: {
      team_id: selectedTeam,
      route_id: route.id,
      points: Number(points),
      completed: true,
      note,
      ...(scorePhoto ? { photo_data: scorePhoto.base64, photo_type: scorePhoto.mimeType } : {}),
    } });
    setSelectedTeam(''); setPoints(''); setNote(''); setScorePhoto(null);
    await loadRouteProgress();
    onNotice('Skor berhasil disimpan.');
  });
  const chooseScorePhoto = async () => {
    if (!mediaPermission?.granted) {
      const permission = await requestMediaPermission();
      if (!permission.granted) {
        onNotice('Izin akses foto diperlukan untuk memilih bukti skor.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, base64: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    if (!asset.base64 || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType) || (asset.fileSize && asset.fileSize > 5 * 1024 * 1024)) {
      onNotice('Pilih foto JPG, PNG, atau WEBP dengan ukuran maksimal 5 MB.');
      return;
    }
    setScorePhoto({ uri: asset.uri, base64: asset.base64, mimeType });
  };
  const saveRoute = () => onSave(async () => {
    await request(`/routes/${route.id}`, token, { method: 'PATCH', body: { name: draftName, instruction: draftInstruction } });
    onNotice('Informasi pos berhasil diperbarui.');
  });

  const checkedInIds = checkIns.map((item) => item.team_id);
  return <View>
    <Pressable onPress={onBack}><Text style={styles.linkText}>← Kembali ke rute</Text></Pressable>
    <View style={styles.detailHero}><Text style={styles.eyebrow}>POS {String(route.position).padStart(2, '0')} · {route.difficulty}</Text><Text style={styles.heroTitleSmall}>{route.name}</Text><Text style={styles.mutedLight}>{route.game_type} · {route.location} · {route.duration} menit · Maks. {route.max_points} poin</Text></View>
    <View style={styles.card}><Text style={styles.cardTitle}>{route.game_type}</Text><Text style={styles.bodyText}>{route.description}</Text><Text style={styles.subheading}>Instruksi permainan</Text><Text style={styles.bodyText}>{route.instruction || 'Instruksi permainan akan ditambahkan oleh fasilitator.'}</Text></View>
    <View style={styles.card}><SectionHeading title="Check-in tim" eyebrow="PROGRES POS" />
      {isFacilitator ? teams.map((team) => <View key={team.id} style={styles.rowBetween}><Text style={styles.bodyText}>{team.name}</Text><Button title={checkedInIds.includes(team.id) ? 'Sudah check-in' : 'Check-in'} secondary={checkedInIds.includes(team.id)} disabled={checkedInIds.includes(team.id)} onPress={() => checkInTeam(team.id)} /></View>) : checkIns.map((item) => <Text key={item.id} style={styles.bodyText}>✓ {item.team.name}</Text>)}
      {!checkIns.length && !isFacilitator && <Empty text="Belum ada tim check-in." />}
    </View>
    {isFacilitator && <View style={styles.card}><SectionHeading title="Simpan skor" eyebrow="GAME SELESAI" />
      <Field label="Tim check-in"><View style={styles.choiceList}>{teams.filter((team) => checkedInIds.includes(team.id) && !scores.some((score) => score.team.id === team.id)).map((team) => <Choice key={team.id} label={team.name} active={selectedTeam === team.id} onPress={() => setSelectedTeam(team.id)} />)}</View></Field>
      <Field label="Poin"><TextInput style={styles.input} value={points} onChangeText={setPoints} keyboardType="number-pad" placeholder="0" /></Field>
      <Field label="Catatan"><TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Catatan permainan" /></Field>
      <Button title={scorePhoto ? 'Ganti foto bukti' : '＋ Foto bukti (opsional)'} secondary onPress={chooseScorePhoto} />
      {scorePhoto && <Image source={{ uri: scorePhoto.uri }} style={styles.pickedImage} />}
      <Button title="Simpan skor  →" disabled={!selectedTeam || !points || Number(points) < 0} onPress={saveScore} />
    </View>}
    <View style={styles.card}><SectionHeading title="Skor tersimpan" /><View style={styles.stack}>{scores.map((score) => <View key={score.id} style={styles.rowBetween}><Text style={styles.bodyText}>{score.team.name}</Text><Text style={styles.points}>{score.points} PTS</Text></View>)}{!scores.length && <Empty text="Belum ada skor di pos ini." />}</View></View>
    {isFacilitator && <View style={styles.card}><SectionHeading title="Edit informasi pos" /><Field label="Nama pos"><TextInput style={styles.input} value={draftName} onChangeText={setDraftName} /></Field><Field label="Instruksi permainan"><TextInput style={[styles.input, styles.multiline]} value={draftInstruction} onChangeText={setDraftInstruction} multiline /></Field><Button title="Simpan perubahan" onPress={saveRoute} /></View>}
  </View>;
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{label}</Text></Pressable>;
}

function TeamsScreen({ teams, token, isFacilitator, onSave }: { teams: Team[]; token: string; isFacilitator: boolean; onSave: (action: () => Promise<void>) => Promise<void> }) {
  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [memberNames, setMemberNames] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const addTeam = () => onSave(async () => {
    const initials = name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    await request('/teams', token, { method: 'POST', body: {
      name: name.trim(), initials, motto: motto.trim(), status: isFacilitator ? 'approved' : 'pending',
      members: memberNames.split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      ...(isFacilitator ? { account_name: accountName.trim(), account_email: accountEmail.trim(), account_password: accountPassword, account_role: 'CUSTOMER' } : {}),
    } });
    setName(''); setMotto(''); setMemberNames(''); setAccountName(''); setAccountEmail(''); setAccountPassword(''); setShowForm(false);
  });
  const updateTeam = (team: Team, status: string) => onSave(async () => { await request(`/teams/${team.id}`, token, { method: 'PATCH', body: { status } }); });
  const removeTeam = (team: Team) => onSave(async () => {
    await request(`/teams/${team.id}`, token, { method: 'DELETE' });
  });
  const deleteTeam = (team: Team) => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`Hapus tim ${team.name} beserta skor terkait?`)) void removeTeam(team);
      return;
    }

    Alert.alert('Hapus tim?', `Tim ${team.name} beserta skor terkait akan dihapus.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { void removeTeam(team); } },
    ]);
  };

  return <>
    <SectionHeading title="Tim peserta" eyebrow="KOMUNITAS PETUALANG" />
    <Text style={styles.bodyText}>Kenali tim yang bertualang di rute Jeep Adventure.</Text>
    <Button title={showForm ? 'Tutup formulir' : isFacilitator ? '＋ Tambah tim' : '＋ Daftarkan tim'} secondary onPress={() => setShowForm(!showForm)} />
    {showForm && <View style={styles.card}><Field label="Nama tim"><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Garuda Offroad" /></Field><Field label="Motto tim"><TextInput style={styles.input} value={motto} onChangeText={setMotto} placeholder="Jelajah tanpa batas!" /></Field><Field label="Anggota (satu nama per baris)"><TextInput style={[styles.input, styles.multiline]} value={memberNames} onChangeText={setMemberNames} multiline /></Field>
      {isFacilitator && <><Text style={styles.eyebrow}>AKUN PESERTA</Text><Field label="Nama akun"><TextInput style={styles.input} value={accountName} onChangeText={setAccountName} /></Field><Field label="Email akun"><TextInput style={styles.input} value={accountEmail} onChangeText={setAccountEmail} autoCapitalize="none" keyboardType="email-address" /></Field><Field label="Password akun (min. 8 karakter)"><TextInput style={styles.input} value={accountPassword} onChangeText={setAccountPassword} secureTextEntry /></Field></>}
      <Button title="Simpan tim  →" onPress={addTeam} disabled={!name.trim() || !motto.trim() || (isFacilitator && (!accountName.trim() || !accountEmail.trim() || accountPassword.length < 8))} />
    </View>}
    <View style={styles.stack}>{teams.map((team) => <View key={team.id} style={styles.card}>
      <View style={styles.rowBetween}><View style={styles.teamAvatar}><Text style={styles.teamAvatarText}>{team.initials}</Text></View><Text style={statusStyle(team.status)}>{team.status === 'APPROVED' ? 'Disetujui' : team.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}</Text></View>
      <Text style={styles.cardTitle}>{team.name}</Text><Text style={styles.muted}>“{team.motto}”</Text>
      <Text style={styles.bodyText}>{team.members?.length || 0} anggota · {team.completedRoutes || 0} pos dikunjungi · {team.totalPoints || 0} poin</Text>
      {isFacilitator && <View style={styles.buttonRow}>{team.status !== 'APPROVED' && <Button title="Setujui" onPress={() => updateTeam(team, 'approved')} />}{team.status !== 'REJECTED' && <Button title="Tolak" secondary onPress={() => updateTeam(team, 'rejected')} />}<Button title="Hapus" secondary onPress={() => deleteTeam(team)} /></View>}
    </View>)}{!teams.length && <Empty text="Belum ada tim terdaftar." />}</View>
  </>;
}

function statusStyle(status: string) {
  return [styles.status, status === 'APPROVED' ? styles.statusApproved : status === 'REJECTED' ? styles.statusRejected : styles.statusPending];
}

function ScoresScreen({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  return <><SectionHeading title="Papan skor" eyebrow="PERFORMA PETUALANGAN" /><Text style={styles.bodyText}>Peringkat berdasarkan total poin dari permainan yang telah diselesaikan.</Text><View style={styles.card}>{leaderboard.map((entry, index) => <LeaderboardRow key={entry.teamId} entry={entry} rank={index + 1} />)}{!leaderboard.length && <Empty text="Skor akan muncul setelah tim mendapatkan poin." />}</View></>;
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  return <View style={styles.leaderRow}><Text style={styles.rank}>{String(rank).padStart(2, '0')}</Text><View style={styles.teamAvatar}><Text style={styles.teamAvatarText}>{entry.initials}</Text></View><View style={styles.leaderInfo}><Text style={styles.cardTitle}>{entry.name}</Text><Text style={styles.muted}>{entry.completedGames} game selesai</Text></View><Text style={styles.points}>{entry.totalPoints.toLocaleString()} PTS</Text></View>;
}

function ExperiencesScreen({ experiences, teams, routes, token, onSave, onNotice }: {
  experiences: Experience[];
  teams: Team[];
  routes: AdventureRoute[];
  token: string;
  onSave: (action: () => Promise<void>) => Promise<void>;
  onNotice: (message: string) => void;
}) {
  const [story, setStory] = useState('');
  const [rating, setRating] = useState(5);
  const [teamId, setTeamId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [filter, setFilter] = useState<'all' | 'photo'>('all');
  const [pickerPermission, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const choosePhoto = async () => {
    if (!pickerPermission?.granted) {
      const permission = await requestPermission();
      if (!permission.granted) { onNotice('Izin akses foto diperlukan untuk memilih gambar.'); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, base64: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) { onNotice('Foto gagal dibaca. Pilih foto lain.'); return; }
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) { onNotice('Ukuran foto maksimal 5 MB.'); return; }
    const mimeType = asset.mimeType || 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) { onNotice('Gunakan foto JPG, PNG, atau WEBP.'); return; }
    setPhoto({ uri: asset.uri, base64: asset.base64, mimeType });
  };

  const submit = () => onSave(async () => {
    if (!teamId || !routeId || !story.trim()) throw new Error('Pilih tim, rute, dan isi cerita terlebih dahulu.');
    const team = teams.find((item) => item.id === teamId);
    const result = await request<ApiEnvelope<Experience>>('/experiences', token, { method: 'POST', body: {
      team_id: teamId, route_id: routeId, story: story.trim(), rating,
      ...(photo ? { photo_data: photo.base64, photo_type: photo.mimeType } : {}),
    } });
    setStory(''); setPhoto(null);
    onNotice('Pengalaman tersimpan. Pilih Bagikan untuk menyalin caption dan membuka opsi berbagi.');
    const caption = `Petualangan Jeep bersama tim ${team?.name || 'kami'}! ${result.data.story}\n\n@jeepadventuregarut\n\n#JeepAdventure #OffroadTeamBuilding #TeamBuilding`;
    await Share.share({ message: caption, title: 'Bagikan pengalaman Jeep Adventure' });
  });

  const share = async (experience: Experience) => {
    const caption = `Petualangan Jeep bersama tim ${experience.team.name}! ${experience.story}\n\n@jeepadventuregarut\n\n#JeepAdventure #OffroadTeamBuilding #TeamBuilding`;
    try {
      if (Platform.OS === 'web') {
        if (globalThis.navigator.share) {
          await globalThis.navigator.share({ text: caption, title: 'Bagikan pengalaman Jeep Adventure' });
        } else {
          await globalThis.navigator.clipboard.writeText(caption);
        }
        globalThis.open('https://www.instagram.com/jeepadventuregarut/', '_blank', 'noopener,noreferrer');
        return;
      }

      await Share.share({ message: caption, title: 'Bagikan pengalaman Jeep Adventure' });
      await Linking.openURL('https://www.instagram.com/jeepadventuregarut/');
    } catch {
      onNotice('Caption tidak dapat dibagikan atau Instagram tidak dapat dibuka.');
    }
  };

  return <>
    <View style={styles.experienceHero}><Text style={styles.eyebrow}>CERITA PETUALANGAN</Text><Text style={styles.heroTitleSmall}>Petualangan lebih seru jika dibagikan.</Text><Text style={styles.mutedLight}>Bagikan keseruanmu dan beri inspirasi untuk petualangan berikutnya.</Text></View>
    <View style={styles.card}><SectionHeading title="Formulir berbagi cerita" eyebrow="POST BARU" />
      <Field label="Pilih tim"><View style={styles.choiceList}>{teams.map((team) => <Choice key={team.id} label={team.name} active={teamId === team.id} onPress={() => setTeamId(team.id)} />)}</View></Field>
      <Field label="Pilih rute"><View style={styles.choiceList}>{routes.map((route) => <Choice key={route.id} label={route.name} active={routeId === route.id} onPress={() => setRouteId(route.id)} />)}</View></Field>
      <Field label="Rating bintang"><View style={styles.ratingRow}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setRating(value)}><Text style={[styles.star, value <= rating && styles.starActive]}>★</Text></Pressable>)}</View></Field>
      <Field label={`Cerita keseruan (${story.length}/280)`}><TextInput style={[styles.input, styles.multiline]} value={story} onChangeText={(value) => setStory(value.slice(0, 280))} maxLength={280} multiline placeholder="Bagikan momen paling berkesan..." /></Field>
      <Button title={photo ? 'Ganti foto' : '＋ Pilih foto'} secondary onPress={choosePhoto} />
      {photo && <View style={styles.photoFrame}><Image source={{ uri: photo.uri }} style={styles.pickedImage} /><Pressable onPress={() => setPhoto(null)}><Text style={styles.linkText}>Hapus foto</Text></Pressable></View>}
      <Text style={styles.muted}>JPG, PNG, WEBP · Maksimal 5 MB</Text>
      <Button title="Kirim pengalaman  →" onPress={submit} disabled={!teamId || !routeId || !story.trim()} />
    </View>
    <SectionHeading title="Galeri pengalaman" eyebrow={`${experiences.length} CERITA TIM`} />
    <View style={styles.buttonRow}><Button title="Semua" secondary={filter !== 'all'} onPress={() => setFilter('all')} /><Button title="Foto" secondary={filter !== 'photo'} onPress={() => setFilter('photo')} /></View>
    <View style={styles.stack}>{experiences.filter((experience) => filter === 'all' || Boolean(experience.media_url)).map((experience) => <View key={experience.id} style={styles.card}>
      {experience.media_url && <Image source={{ uri: experience.media_url }} style={styles.galleryImage} />}
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{experience.team.name} · {experience.route.name}</Text><Text style={styles.ratingText}>★ {experience.rating}.0</Text></View>
      <Text style={styles.bodyText}>{experience.story}</Text><Text style={styles.muted}>Oleh {experience.user.name}</Text>
      <Button title="Bagikan ke Instagram  →" secondary onPress={() => share(experience)} />
    </View>)}{!experiences.length && <Empty text="Belum ada cerita tersimpan. Jadilah yang pertama!" />}</View>
  </>;
}

function Empty({ text }: { text: string }) {
  return <View style={styles.empty}><Text style={styles.muted}>{text}</Text></View>;
}

const colors = { green: '#123d34' };
const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#fbf9f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#fbf9f5' },
  content: { padding: 16, paddingBottom: 30, gap: 14 },
  topBar: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#123d34' },
  topBarAction: { color: '#edf4ed', fontSize: 12, fontWeight: '700' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#e9f0e8' },
  brandMarkText: { color: '#123d34', fontSize: 19, fontWeight: '900' },
  brandText: { color: '#123d34', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  brandTextLight: { color: '#f3f5ef' },
  brandAdventure: { color: '#91b59a', fontWeight: '500' },
  greeting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  greetingTitle: { marginTop: 3, color: '#22332d', fontSize: 25, fontWeight: '800', letterSpacing: -0.7 },
  refresh: { color: '#356d54', fontSize: 11, fontWeight: '700' },
  eyebrow: { color: '#668171', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  hero: { overflow: 'hidden', padding: 21, borderRadius: 19, backgroundColor: '#123d34' },
  heroEyebrow: { color: '#b3cfb9', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { maxWidth: 300, marginTop: 15, color: '#fff', fontSize: 34, fontWeight: '900', lineHeight: 36, letterSpacing: -1.3 },
  heroTitleSmall: { marginTop: 7, color: '#fff', fontSize: 27, fontWeight: '900', lineHeight: 31, letterSpacing: -0.7 },
  heroText: { maxWidth: 320, marginTop: 9, color: '#d5e3d8', fontSize: 12, lineHeight: 18 },
  heroAccent: { alignSelf: 'flex-start', marginTop: 18, padding: 8, borderRadius: 99, color: '#f1e3be', backgroundColor: 'rgba(255,255,255,.1)', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: { width: '48%', minHeight: 83, justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#ebe7df', borderRadius: 13, backgroundColor: '#fffefa' },
  statIcon: { position: 'absolute', top: 7, right: 10, color: '#709078', fontSize: 16 },
  statValue: { color: '#22332d', fontSize: 22, fontWeight: '900' },
  statLabel: { marginTop: 2, color: '#78827c', fontSize: 10 },
  sectionHeading: { marginTop: 5, marginBottom: 5 },
  sectionTitle: { marginTop: 3, color: '#22332d', fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  stack: { gap: 10 },
  card: { gap: 10, padding: 15, borderWidth: 1, borderColor: '#e8e5df', borderRadius: 15, backgroundColor: '#fffefa' },
  routeCard: { gap: 8, padding: 16, borderWidth: 1, borderColor: '#e8e5df', borderLeftWidth: 4, borderLeftColor: '#2d735b', borderRadius: 15, backgroundColor: '#fffefa' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  routePosition: { color: '#367055', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  routeDifficulty: { color: '#7c837b', fontSize: 10 },
  cardTitle: { color: '#22332d', fontSize: 14, fontWeight: '800' },
  routeMeta: { color: '#78827c', fontSize: 11 },
  muted: { color: '#78827c', fontSize: 11, lineHeight: 16 },
  mutedLight: { marginTop: 10, color: '#d5e3d8', fontSize: 12, lineHeight: 18 },
  bodyText: { color: '#536159', fontSize: 12, lineHeight: 19 },
  linkText: { color: '#226553', fontSize: 11, fontWeight: '800' },
  button: { minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#123d34' },
  buttonSecondary: { borderWidth: 1, borderColor: '#dce6dc', backgroundColor: '#f3f7f2' },
  buttonDisabled: { opacity: 0.48 },
  buttonText: { color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  buttonTextSecondary: { color: '#245c43' },
  field: { gap: 6 },
  fieldLabel: { color: '#38463f', fontSize: 11, fontWeight: '800' },
  input: { minHeight: 42, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: '#deded7', borderRadius: 9, color: '#22332d', backgroundColor: '#fff', fontSize: 13 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  tabBar: { minHeight: 57, flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 3, borderTopWidth: 1, borderTopColor: '#e9e4dc', backgroundColor: '#fffefa' },
  tabButton: { minWidth: 56, alignItems: 'center', justifyContent: 'center', gap: 1 },
  tabIcon: { color: '#817d74', fontSize: 18 },
  tabLabel: { color: '#817d74', fontSize: 9 },
  tabActive: { color: '#e96a32', fontWeight: '900' },
  notice: { padding: 11, borderRadius: 9 },
  noticeError: { backgroundColor: '#fff0ee' },
  noticeSuccess: { backgroundColor: '#edf7ef' },
  noticeInfo: { backgroundColor: '#edf3f6' },
  noticeText: { color: '#46534b', fontSize: 11, lineHeight: 16 },
  detailHero: { gap: 4, marginTop: 12, marginBottom: 3, padding: 19, borderRadius: 17, backgroundColor: '#123d34' },
  subheading: { color: '#22332d', fontSize: 12, fontWeight: '900' },
  choiceList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  choice: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#e0e3dc', borderRadius: 8, backgroundColor: '#fff' },
  choiceActive: { borderColor: '#123d34', backgroundColor: '#e8f0e9' },
  choiceText: { color: '#5b665e', fontSize: 10 },
  choiceTextActive: { color: '#123d34', fontWeight: '800' },
  teamAvatar: { width: 37, height: 37, alignItems: 'center', justifyContent: 'center', borderRadius: 50, backgroundColor: '#e7f0e8' },
  teamAvatarText: { color: '#123d34', fontSize: 11, fontWeight: '900' },
  status: { paddingHorizontal: 8, paddingVertical: 5, overflow: 'hidden', borderRadius: 30, fontSize: 10, fontWeight: '800' },
  statusApproved: { color: '#236743', backgroundColor: '#e8f5eb' },
  statusPending: { color: '#99621a', backgroundColor: '#fff4dc' },
  statusRejected: { color: '#99433a', backgroundColor: '#fff0ee' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  leaderRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#efede8' },
  rank: { width: 21, color: '#9a7a36', fontSize: 10, fontWeight: '900' },
  leaderInfo: { flex: 1 },
  points: { color: '#1e694e', fontSize: 11, fontWeight: '900' },
  experienceHero: { padding: 20, borderRadius: 17, backgroundColor: '#153828' },
  ratingRow: { flexDirection: 'row', gap: 4 },
  star: { color: '#cbd0c8', fontSize: 25 },
  starActive: { color: '#e9a52b' },
  ratingText: { color: '#bf8a23', fontSize: 11, fontWeight: '900' },
  photoFrame: { gap: 8 },
  pickedImage: { width: '100%', height: 180, borderRadius: 11 },
  galleryImage: { width: '100%', height: 195, borderRadius: 10, backgroundColor: '#edf1e9' },
  empty: { padding: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#d9ddd4', borderRadius: 12 },
  loginPage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: '#f4f2ed' },
  loginCard: { width: '100%', maxWidth: 440, gap: 14, padding: 23, borderWidth: 1, borderColor: '#e8e5df', borderRadius: 20, backgroundColor: '#fffefa' },
  loginTitle: { marginTop: 2, color: '#22332d', fontSize: 35, fontWeight: '900', letterSpacing: -1 },
  loginFoot: { color: '#859088', textAlign: 'center', fontSize: 10 },
});
