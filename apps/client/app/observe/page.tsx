'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RobotCard } from './RobotCard';
import { LogOutIcon } from '../room/icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type StreamingRoom = {
  id: string;
  name: string;
  robot_name?: string;
  is_online: boolean;
  is_streaming: boolean;
  track_names: string[];
  livekit_url: string;
  livekit_room_name: string;
};

export default function ObservePage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<StreamingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackFilter, setTrackFilter] = useState('fork');
  const [nameFilter, setNameFilter] = useState('');

  const fetchRooms = useCallback(async () => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const resp = await fetch('/api/observe', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.status === 401) {
        sessionStorage.removeItem('access_token');
        router.push('/');
        return;
      }
      if (!resp.ok) throw new Error('Failed to fetch');
      const data = await resp.json();
      setRooms(data.rooms || []);
    } catch (e) {
      setError('Failed to load robots');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleLogout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    router.push('/');
  };

  // Filter rooms: only show streaming robots, with optional name filter
  const filteredRooms = rooms.filter((r) => {
    if (!r.is_streaming) return false;
    if (nameFilter) {
      const name = (r.robot_name || r.name).toLowerCase();
      if (!name.includes(nameFilter.toLowerCase())) return false;
    }
    return true;
  });

  const streamingCount = rooms.filter((r) => r.is_streaming).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050812]">
        <div className="flex flex-col items-center gap-4">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/20" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500/80" />
          </span>
          <div className="text-[12px] text-white/40 font-mono uppercase tracking-wider">
            Discovering robots…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050812]">
      {/* Header */}
      <div className="px-8 pt-6 pb-0">
        <div className="flex items-end justify-between border-b border-white/[0.06] pb-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-medium tracking-tight text-white">Observe</h1>
              {streamingCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-white/40">
                  {streamingCount} streaming
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[12px] text-white/30">
              Live camera feeds from all active robots. Click to operate.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Name filter */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                Name
              </label>
              <input
                type="text"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="all"
                className="w-28 px-2.5 py-1.5 text-[12px] bg-white/[0.04] border border-white/[0.08] rounded-md text-white placeholder-white/25 focus:outline-none focus:border-white/[0.2] transition-all"
              />
            </div>

            {/* Track filter */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                Track
              </label>
              <input
                type="text"
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                placeholder="fork"
                className="w-28 px-2.5 py-1.5 text-[12px] bg-white/[0.04] border border-white/[0.08] rounded-md text-white placeholder-white/25 focus:outline-none focus:border-white/[0.2] transition-all"
              />
            </div>

            {/* Navigate to operate */}
            <button
              onClick={() => router.push('/room')}
              className="px-3 py-1.5 text-[11px] font-medium rounded-md border border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              Operate
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all"
              title="Sign out"
            >
              <LogOutIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-[13px] text-red-400 mb-2">Connection error</div>
            <div className="text-[11px] text-white/30">{error}</div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg
                className="h-7 w-7 text-white/20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <p className="text-[13px] text-white/30 mb-1">No robots streaming</p>
            <p className="text-[11px] text-white/20">
              Robots will appear here when they come online and start publishing video
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => (
              <RobotCard
                key={room.id}
                room={room}
                preferredTrack={trackFilter}
                onClick={() => router.push(`/room?robot=${room.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
