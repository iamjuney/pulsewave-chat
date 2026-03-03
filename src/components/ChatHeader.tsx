import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
                        <Avatar className="h-8 w-8 border-2 border-[#17181c]">
                            <AvatarFallback className="bg-red-500 text-white text-[10px]">RA</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-8 w-8 border-2 border-[#17181c]">
                            <AvatarFallback className="bg-blue-500 text-white text-[10px]">JD</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-8 w-8 border-2 border-[#17181c]">
                            <AvatarFallback className="bg-green-500 text-white text-[10px]">MK</AvatarFallback>
                        </Avatar>
                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 border-2 border-[#17181c] flex items-center justify-center text-indigo-400 font-bold text-[10px]">
                            +
                        </div>
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
