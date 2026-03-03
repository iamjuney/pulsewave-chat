import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Room, RoomMember, User } from "@/module_bindings/types";
import { Search } from "lucide-react";
import React, { useState } from "react";
import { RoomList } from "./RoomList";

interface ChatSidebarProps {
    rooms: readonly Room[];
    roomMembers: readonly RoomMember[];
    users: readonly User[];
    selectedRoomId: bigint | null;
    currentIdentity: string;
    currentUserName: string;
    currentAvatarUrl?: string | null;
    unreadCounts: Map<string, number>;
    onSelectRoom: (roomId: bigint) => void;
    onCreateRoom: (name: string) => void;
    onCreateDm: (targetIdentity: string) => void;
    onEditName: () => void;
    onOpenProfile: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    rooms,
    roomMembers,
    users,
    selectedRoomId,
    currentIdentity,
    currentUserName,
    currentAvatarUrl,
    unreadCounts,
    onSelectRoom,
    onCreateRoom,
    onCreateDm,
    onEditName,
    onOpenProfile,
}) => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelName.trim()) return;
        onCreateRoom(newChannelName.trim());
        setNewChannelName("");
        setIsCreateOpen(false);
    };
    return (
        <div className="flex flex-col h-full bg-[#1C1C24] border-r border-[#1e1e24]">
            <div className="p-6 pb-2 shrink-0">
                <div className="relative mb-6">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
                    <Input 
                        placeholder="Search chat" 
                        className="h-9 w-full bg-[#141418] border-none text-xs pl-10 placeholder:text-muted-foreground/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/50"
                    />
                </div>
                
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <button 
                            className="w-full h-11 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl text-[13px] font-semibold tracking-wide shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                        >
                            Start new chat
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleCreateSubmit}>
                            <DialogHeader>
                                <DialogTitle>Start new chat</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Input
                                        id="name"
                                        placeholder="Channel name..."
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        className="col-span-3"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Channel</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <RoomList
                rooms={rooms}
                roomMembers={roomMembers}
                users={users}
                selectedRoomId={selectedRoomId}
                currentIdentity={currentIdentity}
                unreadCounts={unreadCounts}
                onSelectRoom={onSelectRoom}
                onCreateRoom={onCreateRoom}
                onCreateDm={onCreateDm}
            />
        </div>
    );
};
