import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Hash,
    Menu,
    LogOut,
    User,
    Search,
    Users,
    UserPlus,
} from "lucide-react";
import { useAuth } from "react-oidc-context";
import type { Room, RoomMember } from "@/module_bindings/types";

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
        <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden -ml-2 shrink-0"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        {sidebarContent}
                    </SheetContent>
                </Sheet>

                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-lg">
                        {room?.isDm ? (
                            <Users className="h-4 w-4 text-primary" />
                        ) : (
                            <Hash className="h-4 w-4 text-primary" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-bold leading-none tracking-tight">
                            {room?.name || "Select a channel"}
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                {memberCount}{" "}
                                {memberCount === 1 ? "Member" : "Members"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {!isMember && room && !room.isDm && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2"
                        onClick={onJoinRoom}
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        Join Channel
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-primary"
                    onClick={onToggleSearch}
                    title="Search messages"
                >
                    <Search className="h-4 w-4" />
                </Button>

                {!settingName ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 gap-2 border-border/50 hover:bg-accent/50 group"
                            onClick={onEditName}
                        >
                            <div className="h-5 w-5 bg-primary/10 rounded flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                            </div>
                            <span className="font-semibold text-xs">
                                {currentUserName}
                            </span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => auth.signoutRedirect()}
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <form
                        onSubmit={handleNameSubmit}
                        className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200"
                    >
                        <Input
                            className="h-8 text-xs w-32 sm:w-48 focus-visible:ring-primary"
                            autoFocus
                            placeholder="New display name..."
                            value={newName}
                            onChange={(e) => onNewNameChange(e.target.value)}
                            onBlur={() => {
                                if (
                                    newName.trim() === "" ||
                                    newName === currentUserName
                                ) {
                                    onCancelEditName();
                                } else {
                                    onSubmitName();
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") onCancelEditName();
                            }}
                        />
                    </form>
                )}
            </div>
        </header>
    );
};
