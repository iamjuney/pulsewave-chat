import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Mic, Send, X, Zap } from "lucide-react";
import React, { useState } from "react";
import { ReplyPreview } from "./ReplyPreview";

interface ChatInputProps {
    onSendMessage: (text: string, imageUrl?: string) => Promise<void>;
    onTyping?: () => void;
    typingUsers?: string[];
    replyTo?: { senderName: string; text: string } | null;
    onCancelReply?: () => void;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    onTyping,
    typingUsers = [],
    replyTo,
    onCancelReply,
    disabled,
}) => {
    const [message, setMessage] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [showImageInput, setShowImageInput] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((message.trim() === "" && !imageUrl.trim()) || isSending) return;

        setIsSending(true);
        try {
            await onSendMessage(message, imageUrl.trim() || undefined);
            setMessage("");
            setImageUrl("");
            setShowImageInput(false);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-4 bg-[#17181c] shrink-0">
            {/* Typing indicator */}
            {typingUsers.length > 0 && (
                <div className="max-w-5xl mx-auto w-full mb-2 px-1">
                    <p className="text-xs text-muted-foreground animate-pulse">
                        {typingUsers.length === 1
                            ? `${typingUsers[0]} is typing...`
                            : typingUsers.length === 2
                              ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                              : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`}
                    </p>
                </div>
            )}

            <div className="max-w-5xl mx-auto w-full">
                {/* Reply preview */}
                {replyTo && (
                    <ReplyPreview
                        senderName={replyTo.senderName}
                        text={replyTo.text}
                        onClose={() => onCancelReply?.()}
                    />
                )}

                {/* Image URL input */}
                {showImageInput && (
                    <div className="flex items-center gap-2 mb-2">
                        <Input
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Paste image URL..."
                            className="h-8 text-xs flex-1"
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => {
                                setShowImageInput(false);
                                setImageUrl("");
                            }}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex max-w-4xl mx-auto"
                >
                    <div className="relative flex-1 flex items-center bg-[#202127] rounded-xl pl-4 pr-3 py-2">
                        <Mic className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                        <Textarea
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                onTyping?.();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder={
                                disabled
                                    ? "Join this channel to send messages..."
                                    : "Type something..."
                            }
                            className="min-h-[40px] max-h-[160px] w-full resize-none border-0 bg-transparent text-[14px] py-2 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none text-white overflow-hidden"
                            rows={1}
                            disabled={disabled}
                        />
                        <div className="flex items-center gap-1 ml-4 shrink-0 bg-[#17181c] p-1 rounded-xl">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 ${imageUrl ? "text-primary" : ""}`}
                                onClick={() => setShowImageInput(!showImageInput)}
                                title="Add image URL"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5"
                            >
                                <Zap className="h-4 w-4" />
                            </Button>
                            <Button
                                type="submit"
                                size="icon"
                                className="h-8 w-8 rounded-lg bg-white text-black hover:bg-gray-200 transition-colors ml-1"
                                disabled={
                                    (message.trim() === "" && !imageUrl.trim()) ||
                                    isSending ||
                                    disabled
                                }
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </form>
                <p className="text-[10px] text-center text-muted-foreground/50 mt-2 font-medium">
                    Press <kbd className="px-1 rounded bg-muted">Enter</kbd> to
                    send •{" "}
                    <kbd className="px-1 rounded bg-muted">Shift + Enter</kbd>{" "}
                    for new line
                </p>
            </div>
        </div>
    );
};
