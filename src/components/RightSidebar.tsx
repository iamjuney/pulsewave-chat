import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch"; // Added Switch import
import { Plus } from "lucide-react"; // Added Plus import
import React from "react";

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
    return (
        <aside className="hidden lg:flex flex-col w-[320px] bg-[#17181c] border-l border-[#1e1e24] shrink-0 p-6 overflow-y-auto no-scrollbar">

            {/* Profile Section */}
            <div className="flex flex-col items-center mb-10 pt-4">
                <Avatar className="h-24 w-24 mb-4 ring-4 ring-[#1C1C24] shadow-xl">
                    <AvatarImage src={currentAvatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                        {currentUserName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{currentUserName}</h2>
                <p className="text-sm text-muted-foreground/80 font-medium">Software Engineer</p>
                <div className="flex items-center justify-between mt-6 w-full pt-6 border-t border-[#1e1e24]">
                    <span className="text-sm font-semibold text-foreground/80">
                        Dark Mode
                    </span>
                    <Switch defaultChecked />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-8 pb-6">
                    {/* To-Do Lists */}
                    <div>
                        <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center justify-between">
                            To-Do Lists
                            <button className="h-6 w-6 rounded-full bg-[#202127] flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                                <Plus className="h-3 w-3" />
                            </button>
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3.5 bg-[#202127] rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-white transition-colors">Buy birthday cakes</span>
                                <span className="text-lg">🎂</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-[#202127] rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-white transition-colors">Watering the plant</span>
                                <span className="text-lg">🪴</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-[#202127] rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-white transition-colors">Make a salad days</span>
                                <span className="text-lg">🥕</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-[#202127] rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-white transition-colors">Pay electricity bills</span>
                                <span className="text-lg">⚡</span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 bg-[#202127] rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-white transition-colors">Check the weather</span>
                                <span className="text-lg">🌧️</span>
                            </div>
                        </div>
                    </div>

                    {/* Shared Photos */}
                    <div>
                        <h3 className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Shared Photos</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-500 aspect-square rounded-2xl flex items-center justify-center p-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/20">
                                <span className="text-5xl drop-shadow-lg">🐋</span>
                            </div>
                            <div className="bg-yellow-400 aspect-square rounded-2xl flex items-center justify-center p-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-yellow-400/20">
                                <span className="text-5xl drop-shadow-lg">👱</span>
                            </div>
                            <div className="bg-pink-300 aspect-square rounded-2xl flex items-center justify-center p-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-pink-300/20">
                                <span className="text-5xl drop-shadow-lg">👄</span>
                            </div>
                            <div className="bg-purple-300 aspect-square rounded-2xl flex items-center justify-center p-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg shadow-purple-300/20">
                                <span className="text-5xl drop-shadow-lg">💅</span>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    );
};
