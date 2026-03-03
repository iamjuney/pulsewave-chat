import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Check, Circle, Pencil } from "lucide-react";
import React, { useState } from "react";

interface UserProfileCardProps {
    name: string;
    identity: string;
    bio?: string | null;
    avatarUrl?: string | null;
    online: boolean;
    isOwnProfile: boolean;
    onUpdateProfile?: (bio: string, avatarUrl: string) => void;
    onClose: () => void;
    onStartDm?: () => void;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
    name,
    identity,
    bio,
    avatarUrl,
    online,
    isOwnProfile,
    onUpdateProfile,
    onClose,
    onStartDm,
}) => {
    const [editing, setEditing] = useState(false);
    const [editBio, setEditBio] = useState(bio || "");
    const [editAvatarUrl, setEditAvatarUrl] = useState(avatarUrl || "");

    const handleSave = () => {
        onUpdateProfile?.(editBio, editAvatarUrl);
        setEditing(false);
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-3 relative">
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-20 w-20 border-2 border-primary/20">
                                <AvatarImage src={avatarUrl ?? undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                    {name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span
                                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background ${
                                    online
                                        ? "bg-green-500"
                                        : "bg-muted-foreground/30"
                                }`}
                            />
                        </div>
                        <div className="text-center">
                            <DialogTitle className="text-lg text-center">{name}</DialogTitle>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                {identity.substring(0, 16)}...
                            </p>
                            <Badge
                                variant={online ? "default" : "secondary"}
                                className="mt-1.5 text-[10px]"
                            >
                                <Circle
                                    className={`h-1.5 w-1.5 mr-1 ${online ? "fill-green-400" : "fill-muted-foreground"}`}
                                />
                                {online ? "Online" : "Offline"}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>
                <Separator />
                <div className="p-6 pt-4 space-y-4">
                    {editing ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">
                                    Avatar URL
                                </label>
                                <Input
                                    value={editAvatarUrl}
                                    onChange={(e) =>
                                        setEditAvatarUrl(e.target.value)
                                    }
                                    placeholder="https://example.com/avatar.png"
                                    className="mt-1 h-8 text-xs"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">
                                    Bio
                                </label>
                                <Textarea
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    className="mt-1 text-xs min-h-[60px] resize-none"
                                    maxLength={200}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                                    {editBio.length}/200
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 h-8 text-xs"
                                    onClick={handleSave}
                                >
                                    <Check className="h-3 w-3 mr-1" />
                                    Save
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                        setEditing(false);
                                        setEditBio(bio || "");
                                        setEditAvatarUrl(avatarUrl || "");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                                    About
                                </h4>
                                <p className="text-sm">
                                    {bio || (
                                        <span className="text-muted-foreground/50 italic">
                                            No bio set
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {isOwnProfile && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 h-8 text-xs"
                                        onClick={() => setEditing(true)}
                                    >
                                        <Pencil className="h-3 w-3 mr-1" />
                                        Edit Profile
                                    </Button>
                                )}
                                {!isOwnProfile && onStartDm && (
                                    <Button
                                        size="sm"
                                        className="flex-1 h-8 text-xs"
                                        onClick={onStartDm}
                                    >
                                        Message
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
