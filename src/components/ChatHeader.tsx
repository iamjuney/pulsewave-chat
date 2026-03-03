import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Room } from "@/module_bindings/types";
import {
	Hash,
	UserPlus,
	Users
} from "lucide-react";
import React from "react";
import { useAuth } from "react-oidc-context";

interface ChatHeaderProps {
    room: Room | null;
    memberCount: number;
    onlineMembers?: Array<{
        identityHex: string;
        name: string;
        avatarUrl: string | null;
    }>;
    currentUserName: string;
    settingName: boolean;
    newName: string;
    onNewNameChange: (name: string) => void;
    onSubmitName: () => void;
    onEditName: () => void;
    onCancelEditName: () => void;
    onToggleSearch: () => void;
    onToggleProfile: () => void;
    onJoinRoom: () => void;
    isMember: boolean;
    sidebarContent: React.ReactNode;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    room,
    memberCount,
    onlineMembers,
    currentUserName,
    settingName,
    newName,
    onNewNameChange,
    onSubmitName,
    onEditName,
    onCancelEditName,
    onToggleSearch,
    onToggleProfile,
    onJoinRoom,
    isMember,
    sidebarContent,
}) => {
    const auth = useAuth();

    const onlineDisplay = onlineMembers?.slice(0, 3) || [];
    const remainingOnline = Math.max(0, (onlineMembers?.length || 0) - onlineDisplay.length);
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-pink-500", "bg-purple-500"];
    const getColor = (str: string) => colors[str.charCodeAt(0) % colors.length];

    const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmitName();
    };

    return (
        <header className="h-[88px] flex flex-col justify-center px-8 shrink-0 z-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                        {room?.isDm ? (
                            <Users className="h-4 w-4 text-white" />
                        ) : (
                            <Hash className="h-4 w-4 text-white" />
                        )}
                    </div>
                    <h2 className="text-[15px] font-bold tracking-widest uppercase">
                        {room?.name || "HYPER"}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-2 mr-4">
                        {onlineDisplay.map((user) => (
                            <Avatar key={user.identityHex} className="h-8 w-8 border-2 border-[#17181c]">
                                <AvatarImage src={user.avatarUrl ?? undefined} />
                                <AvatarFallback className={`${getColor(user.identityHex)} text-white text-[10px]`}>
                                    {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {remainingOnline > 0 && (
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 border-2 border-[#17181c] flex items-center justify-center text-indigo-400 font-bold text-[10px]">
                                +{remainingOnline}
                            </div>
                        )}
                        {!onlineMembers?.length && (
                            <div className="text-[11px] text-muted-foreground mr-2 px-2">No one online</div>
                        )}
                    </div>
                    
                    {!isMember && room && !room.isDm && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 bg-[#202127] border-0"
                            onClick={onJoinRoom}
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Join Channel
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};
