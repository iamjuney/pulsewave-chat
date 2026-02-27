import React from "react";
import { X, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReplyPreviewProps {
    senderName: string;
    text: string;
    onClose: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
    senderName,
    text,
    onClose,
}) => {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/30 border-l-2 border-primary rounded-t-lg animate-in slide-in-from-bottom-1 duration-150">
            <Reply className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-primary">
                    {senderName}
                </span>
                <p className="text-xs text-muted-foreground truncate">{text}</p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={onClose}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
};
