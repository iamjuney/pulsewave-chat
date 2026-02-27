import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoomList } from "./RoomList";
import type { Room, RoomMember, User } from "@/module_bindings/types";

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
    return (
        <div className="flex flex-col h-full bg-card border-r">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
                <h1 className="text-xl font-bold tracking-tight text-primary">
                    Chat
                </h1>
                <Button variant="ghost" size="icon" onClick={onEditName}>
                    <Settings className="h-4 w-4" />
                </Button>
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

            <div className="p-4 border-t bg-muted/30">
                <button
                    className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity"
                    onClick={onOpenProfile}
                >
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                        <AvatarImage src={currentAvatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                            {currentUserName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 text-left">
                        <span className="text-sm font-semibold truncate">
                            {currentUserName}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                            Active Now
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};
