import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search, MessageSquare } from "lucide-react";
import type { PrettyMessage } from "@/types";

interface MessageSearchProps {
    messages: readonly PrettyMessage[];
    onClose: () => void;
    onGoToMessage: (messageId: bigint) => void;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
    messages,
    onClose,
    onGoToMessage,
}) => {
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQ = query.toLowerCase();
        return messages.filter(
            (m) =>
                m.kind === "user" &&
                (m.text.toLowerCase().includes(lowerQ) ||
                    m.senderName.toLowerCase().includes(lowerQ)),
        );
    }, [messages, query]);

    return (
        <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3 p-4 border-b">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="border-0 focus-visible:ring-0 text-sm h-8 shadow-none"
                    onKeyDown={(e) => {
                        if (e.key === "Escape") onClose();
                    }}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                    {query.trim() === "" ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <Search className="h-10 w-10 opacity-20 mb-3" />
                            <p className="text-sm">Type to search messages</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <MessageSquare className="h-10 w-10 opacity-20 mb-3" />
                            <p className="text-sm">No messages found</p>
                        </div>
                    ) : (
                        results.map((msg) => (
                            <button
                                key={msg.id?.toString() ?? msg.text}
                                onClick={() =>
                                    msg.id !== undefined &&
                                    onGoToMessage(msg.id)
                                }
                                className="w-full text-left p-3 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border/50"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold">
                                        {msg.senderName}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {msg.sent.toDate().toLocaleString([], {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {highlightText(msg.text, query)}
                                </p>
                            </button>
                        ))
                    )}
                    {results.length > 0 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                            {results.length} result
                            {results.length !== 1 ? "s" : ""} found
                        </p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
    return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
            <mark
                key={i}
                className="bg-primary/20 text-foreground rounded px-0.5"
            >
                {part}
            </mark>
        ) : (
            part
        ),
    );
}
