import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Hash,
    MessageCircle,
    Plus,
    Users,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import type { Room, RoomMember, User } from "@/module_bindings/types";

interface RoomListProps {
    rooms: readonly Room[];
    roomMembers: readonly RoomMember[];
    users: readonly User[];
    selectedRoomId: bigint | null;
    currentIdentity: string;
    unreadCounts: Map<string, number>;
    onSelectRoom: (roomId: bigint) => void;
    onCreateRoom: (name: string) => void;
    onCreateDm: (targetIdentity: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({
    rooms,
    roomMembers,
    users,
    selectedRoomId,
    currentIdentity,
    unreadCounts,
    onSelectRoom,
    onCreateRoom,
    onCreateDm,
}) => {
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [channelsExpanded, setChannelsExpanded] = useState(true);
    const [dmsExpanded, setDmsExpanded] = useState(true);
    const [showDmPicker, setShowDmPicker] = useState(false);

    // Get rooms the user is a member of
    const myMemberships = roomMembers.filter(
        (m) => m.userId.toHexString() === currentIdentity,
    );
    const myRoomIds = new Set(myMemberships.map((m) => m.roomId.toString()));

    const channels = rooms.filter(
        (r) => !r.isDm && myRoomIds.has(r.id.toString()),
    );
    const dms = rooms.filter((r) => r.isDm && myRoomIds.has(r.id.toString()));

    // Channels user hasn't joined yet
    const unjoinedChannels = rooms.filter(
        (r) => !r.isDm && !myRoomIds.has(r.id.toString()),
    );

    // Get other user in a DM
    const getDmPartner = (room: Room) => {
        const members = roomMembers.filter(
            (m) =>
                m.roomId === room.id &&
                m.userId.toHexString() !== currentIdentity,
        );
        if (members.length === 0) return null;
        return users.find(
            (u) => u.identity.toHexString() === members[0].userId.toHexString(),
        );
    };

    // Users who can be DM'd (not already in a DM)
    const dmPartnerIds = new Set(
        dms
            .map((dm) => getDmPartner(dm)?.identity.toHexString())
            .filter(Boolean),
    );
    const availableDmUsers = users.filter(
        (u) =>
            u.identity.toHexString() !== currentIdentity &&
            !dmPartnerIds.has(u.identity.toHexString()),
    );

    const handleCreateChannel = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelName.trim()) return;
        onCreateRoom(newChannelName.trim());
        setNewChannelName("");
        setShowCreateChannel(false);
    };

    return (
        <ScrollArea className="flex-1">
            <div className="py-2">
                {/* Channels Section */}
                <div className="px-2 mb-1">
                    <div className="flex items-center justify-between w-full px-2 py-1.5">
                        <button
                            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                            onClick={() =>
                                setChannelsExpanded(!channelsExpanded)
                            }
                        >
                            {channelsExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                            Channels
                        </button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-primary"
                            onClick={() =>
                                setShowCreateChannel(!showCreateChannel)
                            }
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {showCreateChannel && (
                    <form onSubmit={handleCreateChannel} className="px-3 mb-2">
                        <Input
                            autoFocus
                            placeholder="Channel name..."
                            value={newChannelName}
                            onChange={(e) => setNewChannelName(e.target.value)}
                            onBlur={() => {
                                if (!newChannelName.trim())
                                    setShowCreateChannel(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Escape")
                                    setShowCreateChannel(false);
                            }}
                            className="h-8 text-xs"
                        />
                    </form>
                )}

                {channelsExpanded && (
                    <div className="px-2 space-y-0.5">
                        {channels.map((room) => {
                            const isSelected = selectedRoomId === room.id;
                            const unread =
                                unreadCounts.get(room.id.toString()) || 0;
                            return (
                                <button
                                    key={room.id.toString()}
                                    onClick={() => onSelectRoom(room.id)}
                                    className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                                        isSelected
                                            ? "bg-accent text-accent-foreground font-medium"
                                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    }`}
                                >
                                    <Hash className="h-4 w-4 shrink-0 opacity-60" />
                                    <span className="truncate flex-1 text-left">
                                        {room.name}
                                    </span>
                                    {unread > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="h-5 min-w-5 px-1.5 text-[10px] font-bold"
                                        >
                                            {unread}
                                        </Badge>
                                    )}
                                </button>
                            );
                        })}

                        {/* Unjoined channels */}
                        {unjoinedChannels.length > 0 && (
                            <>
                                <div className="px-2 pt-2">
                                    <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                                        Browse channels
                                    </span>
                                </div>
                                {unjoinedChannels.map((room) => (
                                    <button
                                        key={room.id.toString()}
                                        onClick={() => onSelectRoom(room.id)}
                                        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground transition-colors italic"
                                    >
                                        <Hash className="h-4 w-4 shrink-0 opacity-40" />
                                        <span className="truncate flex-1 text-left">
                                            {room.name}
                                        </span>
                                        <Users className="h-3 w-3 opacity-40" />
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}

                <Separator className="my-3 mx-3" />

                {/* DMs Section */}
                <div className="px-2 mb-1">
                    <div className="flex items-center justify-between w-full px-2 py-1.5">
                        <button
                            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                            onClick={() => setDmsExpanded(!dmsExpanded)}
                        >
                            {dmsExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                            Direct Messages
                        </button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-primary"
                            onClick={() => setShowDmPicker(!showDmPicker)}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {showDmPicker && availableDmUsers.length > 0 && (
                    <div className="px-3 mb-2 space-y-1">
                        <p className="text-[10px] text-muted-foreground px-1">
                            Start a conversation:
                        </p>
                        {availableDmUsers.map((user) => (
                            <button
                                key={user.identity.toHexString()}
                                onClick={() => {
                                    onCreateDm(user.identity.toHexString());
                                    setShowDmPicker(false);
                                }}
                                className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
                            >
                                <Avatar className="h-5 w-5">
                                    <AvatarImage
                                        src={user.avatarUrl ?? undefined}
                                    />
                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                        {(
                                            user.name ||
                                            user.identity.toHexString()
                                        )
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span>
                                    {user.name ||
                                        user.identity
                                            .toHexString()
                                            .substring(0, 8)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {dmsExpanded && (
                    <div className="px-2 space-y-0.5">
                        {dms.map((room) => {
                            const partner = getDmPartner(room);
                            const isSelected = selectedRoomId === room.id;
                            const unread =
                                unreadCounts.get(room.id.toString()) || 0;
                            const partnerName =
                                partner?.name ||
                                partner?.identity
                                    .toHexString()
                                    .substring(0, 8) ||
                                "Unknown";
                            return (
                                <button
                                    key={room.id.toString()}
                                    onClick={() => onSelectRoom(room.id)}
                                    className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                                        isSelected
                                            ? "bg-accent text-accent-foreground font-medium"
                                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage
                                                src={
                                                    partner?.avatarUrl ??
                                                    undefined
                                                }
                                            />
                                            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                                {partnerName
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {partner?.online && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
                                        )}
                                    </div>
                                    <span className="truncate flex-1 text-left">
                                        {partnerName}
                                    </span>
                                    {unread > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="h-5 min-w-5 px-1.5 text-[10px] font-bold"
                                        >
                                            {unread}
                                        </Badge>
                                    )}
                                </button>
                            );
                        })}
                        {dms.length === 0 && (
                            <p className="text-xs text-muted-foreground/50 px-2 py-2 italic">
                                No conversations yet
                            </p>
                        )}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
};
