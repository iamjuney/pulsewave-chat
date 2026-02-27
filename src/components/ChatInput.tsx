import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ImageIcon, X, Laugh } from "lucide-react";
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
        <div className="p-4 bg-background border-t shrink-0">
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
                    className="flex items-end gap-2 group"
                >
                    <div className="flex gap-1 mb-1 mr-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-full text-muted-foreground hover:text-primary ${imageUrl ? "text-primary" : ""}`}
                            onClick={() => setShowImageInput(!showImageInput)}
                            title="Add image URL"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="relative flex-1 rounded-2xl border bg-muted/30 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
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
                                    : "Type your message..."
                            }
                            className="min-h-[52px] max-h-[200px] w-full resize-none border-0 bg-transparent text-sm py-4 px-6 focus-visible:ring-0 placeholder:text-muted-foreground/60 shadow-none"
                            rows={1}
                            disabled={disabled}
                        />
                        <div className="absolute right-3 bottom-2.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                            >
                                <Laugh className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="icon"
                        className="h-11 w-11 shrink-0 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                        disabled={
                            (message.trim() === "" && !imageUrl.trim()) ||
                            isSending ||
                            disabled
                        }
                    >
                        <Send
                            className={`h-4 w-4 transition-transform ${message.trim() || imageUrl.trim() ? "translate-x-0.5 -translate-y-0.5 rotate-6" : ""}`}
                        />
                    </Button>
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
