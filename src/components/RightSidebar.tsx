import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut, Settings as SettingsIcon } from "lucide-react";
import React from "react";
import { useAuth } from "react-oidc-context";

interface RightSidebarProps {
    currentUserName: string;
    currentAvatarUrl?: string | null;
    onToggleProfile?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
    currentUserName,
    currentAvatarUrl,
    onToggleProfile,
}) => {
    const auth = useAuth();

    return (
        <aside className="hidden lg:flex flex-col w-[320px] bg-[#17181c] border-l border-[#1e1e24] shrink-0 p-6 overflow-y-auto no-scrollbar">

            {/* Profile Section */}
            <div className="flex flex-col items-center mb-10 pt-4">
                <Avatar className="h-24 w-24 mb-4 ring-4 ring-[#1C1C24] shadow-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={onToggleProfile}>
                    <AvatarImage src={currentAvatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                        {currentUserName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{currentUserName}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <button onClick={onToggleProfile} className="flex items-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-foreground/80 transition-colors">
                        <SettingsIcon className="h-3.5 w-3.5" />
                        Edit Profile
                    </button>
                    <button onClick={() => auth.signoutRedirect()} className="flex items-center gap-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full transition-colors">
                        <LogOut className="h-3.5 w-3.5" />
                        Log out
                    </button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-8 pb-6">
                    {/* Features under development */}
                    <div className="flex flex-col items-center justify-center pt-8 opacity-60">
                        <p className="text-xs text-muted-foreground text-center">
                            More features coming soon...
                        </p>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    );
};
