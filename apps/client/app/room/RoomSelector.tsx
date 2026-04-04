'use client';

import { useState } from 'react';
import { EditIcon, LogOutIcon, ForkliftIcon } from './icons';
import { StatusDot } from './StatusDot';

export interface Robot {
  id: string;
  name: string;
  robot_name?: string;
  is_online: boolean;
  last_seen?: string;
}

type RoomSelectorProps = {
  rooms: Robot[];
  selectedIndex: number;
  onSelect: (room: Robot) => void;
  onRename: (roomId: string, newName: string) => Promise<void> | void;
  onLogout: () => void;
};

export function RoomSelector({
  rooms,
  selectedIndex,
  onSelect,
  onRename,
  onLogout,
}: RoomSelectorProps) {
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleRename = async (roomId: string, newName: string) => {
    if (!newName.trim()) {
      setEditingRoomId(null);
      return;
    }
    await onRename(roomId, newName);
    setEditingRoomId(null);
  };

  const onlineCount = rooms.filter((r) => r.is_online).length;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Atmospheric background — layered gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[#050812]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-red-500/[0.08] via-red-500/[0.02] to-transparent" />
      <div className="pointer-events-none absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-red-500/[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -top-20 right-10 w-96 h-96 rounded-full bg-blue-500/[0.03] blur-3xl" />

      {/* Logout button — top right */}
      <button
        onClick={onLogout}
        className="group absolute top-6 right-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/40 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.1] text-[12px] transition-all"
      >
        <LogOutIcon className="h-3.5 w-3.5" />
        <span>Sign out</span>
      </button>

      {/* Main content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
            <ForkliftIcon className="h-6 w-6 text-white/60" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-white mb-1.5">
            Select Robot
          </h1>
          <p className="text-[12px] text-white/30 flex items-center gap-2">
            <StatusDot tone="success" pulse />
            <span>{onlineCount} of {rooms.length} online</span>
            <span className="text-white/20">·</span>
            <span>D-pad to navigate, A to select</span>
          </p>
        </div>

        {/* Room list */}
        <div className="w-full max-w-md space-y-1.5">
          {rooms.map((room, index) => {
            const isSelected = index === selectedIndex;
            const isEditing = editingRoomId === room.id;

            return (
              <div
                key={room.id}
                onClick={() => !isEditing && onSelect(room)}
                className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-white/[0.15] bg-white/[0.05] shadow-[0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.05)]'
                    : 'border-white/[0.04] bg-white/[0.015] hover:border-white/[0.08] hover:bg-white/[0.03]'
                }`}
              >
                {/* Selection indicator bar */}
                {isSelected && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r bg-white/70" />
                )}

                <div className="flex h-8 w-8 items-center justify-center shrink-0">
                  <StatusDot tone={room.is_online ? 'success' : 'neutral'} pulse={room.is_online} size="md" />
                </div>

                {/* Name + details */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(room.id, editName);
                        if (e.key === 'Escape') setEditingRoomId(null);
                      }}
                      onBlur={() => handleRename(room.id, editName)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="w-full bg-transparent text-[15px] text-white font-medium outline-none border-b border-white/[0.2] pb-0.5"
                    />
                  ) : (
                    <div className="text-[15px] text-white font-medium truncate">
                      {room.robot_name || room.name}
                    </div>
                  )}
                  <div className="text-[11px] text-white/30 font-mono mt-0.5 truncate">
                    {room.name}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRoomId(room.id);
                        setEditName(room.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                      title="Rename"
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls hint footer */}
        <div className="mt-10 flex items-center gap-6 text-[10px] text-white/25">
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border border-white/[0.08] bg-white/[0.04] font-mono text-[9px]">
              &#x25B2;
            </kbd>
            <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border border-white/[0.08] bg-white/[0.04] font-mono text-[9px]">
              &#x25BC;
            </kbd>
            <span className="ml-1">navigate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center h-4 px-1.5 rounded border border-white/[0.08] bg-white/[0.04] font-mono text-[9px]">
              A
            </kbd>
            <span>select</span>
          </span>
        </div>
      </div>
    </div>
  );
}
