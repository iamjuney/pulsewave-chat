import React from "react";
import { Send } from "lucide-react";

export const EmptyState: React.FC<{ roomName?: string }> = ({ roomName }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-1000">
        <div className="h-24 w-24 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
            <Send className="h-10 w-10 text-primary/40 relative rotate-12" />
        </div>
        <div className="space-y-1">
            <h3 className="font-bold text-xl tracking-tight">
                No messages yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                Be the first to start the conversation
                {roomName ? ` in #${roomName}` : ""}.
            </p>
        </div>
    </div>
);
