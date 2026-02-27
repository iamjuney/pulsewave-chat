import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PrettyMessage, ReactionGroup } from "@/types";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Pencil,
    Trash2,
    MoreHorizontal,
    SmilePlus,
    Check,
    X,
    Reply,
    ImageIcon,
} from "lucide-react";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "🎉", "😮", "🔥"];

interface ChatMessageProps {
    message: PrettyMessage;
    isMe: boolean;
    showAvatar: boolean;
    reactions?: ReactionGroup[];
    onToggleReaction?: (emoji: string) => void;
    onEdit?: (newText: string) => void;
    onDelete?: () => void;
    onReply?: () => void;
    onClickSender?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    isMe,
    showAvatar,
    reactions = [],
    onToggleReaction,
    onEdit,
    onDelete,
    onReply,
    onClickSender,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    if (message.kind === "system") {
        return (
            <div className="flex justify-center my-4">
                <Badge
                    variant="outline"
                    className="text-[10px] text-muted-foreground font-normal bg-background/50 rounded-full px-3 py-0.5 border-dashed"
                >
                    {message.text}
                </Badge>
            </div>
        );
    }

    const sentDate = message.sent.toDate();
    const timeString = sentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const fullDateString = sentDate.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const handleSaveEdit = () => {
        if (editText.trim() && editText !== message.text && onEdit) {
            onEdit(editText.trim());
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditText(message.text);
        setIsEditing(false);
    };

    return (
        <div
            className={`flex w-full mb-2 group ${isMe ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
                {!isMe && (
                    <div className="shrink-0 w-8 flex flex-col justify-end">
                        {showAvatar ? (
                            <Avatar
                                className="h-8 w-8 border shadow-sm cursor-pointer"
                                onClick={onClickSender}
                            >
                                <AvatarImage src={message.senderAvatarUrl} />
                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                                    {message.senderName
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <div className="w-8" />
                        )}
                    </div>
                )}

                <div
                    className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}
                >
                    {showAvatar && !isMe && (
                        <button
                            onClick={onClickSender}
                            className="text-[10px] font-semibold text-muted-foreground ml-1 mb-0.5 uppercase tracking-tighter hover:text-primary transition-colors"
                        >
                            {message.senderName}
                        </button>
                    )}

                    <div className="relative">
                        {/* Action buttons - visible on hover */}
                        <div
                            className={`absolute ${isMe ? "-left-20" : "-right-20"} top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 z-10`}
                        >
                            {/* Emoji reaction button */}
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                                    onClick={() =>
                                        setShowEmojiPicker(!showEmojiPicker)
                                    }
                                >
                                    <SmilePlus className="h-3.5 w-3.5" />
                                </Button>
                                {showEmojiPicker && (
                                    <div
                                        className={`absolute ${isMe ? "right-0" : "left-0"} top-8 bg-popover border rounded-lg shadow-lg p-1.5 flex gap-1 z-20`}
                                    >
                                        {EMOJI_OPTIONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors text-base"
                                                onClick={() => {
                                                    onToggleReaction?.(emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reply button */}
                            {onReply && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                                    onClick={onReply}
                                >
                                    <Reply className="h-3.5 w-3.5" />
                                </Button>
                            )}

                            {/* Edit/Delete menu for own messages */}
                            {isMe && (onEdit || onDelete) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                                        >
                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align={isMe ? "end" : "start"}
                                    >
                                        {onEdit && (
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditText(message.text);
                                                    setIsEditing(true);
                                                }}
                                            >
                                                <Pencil className="h-3.5 w-3.5 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                        )}
                                        {onDelete && (
                                            <DropdownMenuItem
                                                onClick={onDelete}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* Reply context */}
                        {message.replyToText && (
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1 mb-1 rounded-lg bg-muted/50 border-l-2 border-primary/30 text-xs ${isMe ? "ml-auto" : ""}`}
                            >
                                <Reply className="h-3 w-3 text-primary/50 shrink-0" />
                                <span className="font-medium text-primary/70">
                                    {message.replyToSenderName}
                                </span>
                                <span className="text-muted-foreground truncate max-w-[200px]">
                                    {message.replyToText}
                                </span>
                            </div>
                        )}

                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    value={editText}
                                    onChange={(e) =>
                                        setEditText(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveEdit();
                                        if (e.key === "Escape")
                                            handleCancelEdit();
                                    }}
                                    className="h-9 text-sm min-w-[200px]"
                                    autoFocus
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-green-500"
                                    onClick={handleSaveEdit}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground"
                                    onClick={handleCancelEdit}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`px-4 py-2 rounded-2xl text-[14px] leading-relaxed break-words transition-all duration-200 ${
                                                isMe
                                                    ? "bg-primary text-primary-foreground rounded-br-none shadow-md hover:brightness-110"
                                                    : "bg-card border border-border/50 text-card-foreground rounded-bl-none shadow-sm hover:bg-accent/50"
                                            }`}
                                        >
                                            {message.text && (
                                                <span>{message.text}</span>
                                            )}
                                            {message.imageUrl && (
                                                <div
                                                    className={`${message.text ? "mt-2" : ""}`}
                                                >
                                                    <img
                                                        src={message.imageUrl}
                                                        alt="Shared image"
                                                        className="max-w-[300px] max-h-[300px] rounded-lg object-cover cursor-pointer"
                                                        onClick={() =>
                                                            window.open(
                                                                message.imageUrl,
                                                                "_blank",
                                                                "noopener,noreferrer",
                                                            )
                                                        }
                                                        onError={(e) => {
                                                            (
                                                                e.target as HTMLImageElement
                                                            ).style.display =
                                                                "none";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {message.editedAt && (
                                                <span
                                                    className={`text-[10px] ml-1.5 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                                                >
                                                    (edited)
                                                </span>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side={isMe ? "left" : "right"}
                                        className="text-[10px] py-1 px-2"
                                    >
                                        {fullDateString}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>

                    {/* Reactions */}
                    {reactions.length > 0 && (
                        <div
                            className={`flex flex-wrap gap-1 mt-0.5 ${isMe ? "mr-1" : "ml-1"}`}
                        >
                            {reactions.map((r) => (
                                <button
                                    key={r.emoji}
                                    onClick={() => onToggleReaction?.(r.emoji)}
                                    className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                                        r.reacted
                                            ? "bg-primary/10 border-primary/30 text-primary"
                                            : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-accent"
                                    }`}
                                >
                                    <span>{r.emoji}</span>
                                    <span className="text-[10px] font-medium">
                                        {r.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {showAvatar && (
                        <span
                            className={`text-[9px] text-muted-foreground/60 font-medium ${isMe ? "mr-1" : "ml-1"}`}
                        >
                            {timeString}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
