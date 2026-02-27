import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import "./index.css";
import { tables, reducers } from "./module_bindings";
import { useSpacetimeDB, useTable, useReducer } from "spacetimedb/react";
import { Identity, Timestamp } from "spacetimedb";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { MessageSearch } from "./components/MessageSearch";
import { UserProfileCard } from "./components/UserProfileCard";
import { EmptyState } from "./components/EmptyState";
import type { PrettyMessage, ReactionGroup } from "./types";

function App() {
    // ── Name editing state ──────────────────────────────────────────────
    const [newName, setNewName] = useState("");
    const [settingName, setSettingName] = useState(false);

    // ── Room state ──────────────────────────────────────────────────────
    const [selectedRoomId, setSelectedRoomId] = useState<bigint | null>(null);

    // ── Reply state ─────────────────────────────────────────────────────
    const [replyTo, setReplyTo] = useState<{
        id: bigint;
        senderName: string;
        text: string;
    } | null>(null);

    // ── Search state ────────────────────────────────────────────────────
    const [showSearch, setShowSearch] = useState(false);

    // ── Profile state ───────────────────────────────────────────────────
    const [profileTarget, setProfileTarget] = useState<string | null>(null);
    const [showOwnProfile, setShowOwnProfile] = useState(false);

    // ── System messages ─────────────────────────────────────────────────
    const [systemMessages, setSystemMessages] = useState<
        { sender: Identity; text: string; sent: Timestamp }[]
    >([]);

    // ── Refs ────────────────────────────────────────────────────────────
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // ── SpacetimeDB hooks ───────────────────────────────────────────────
    const { identity, isActive: connected } = useSpacetimeDB();

    const setName = useReducer(reducers.setName);
    const sendMessage = useReducer(reducers.sendMessage);
    const editMessage = useReducer(reducers.editMessage);
    const deleteMessage = useReducer(reducers.deleteMessage);
    const addReaction = useReducer(reducers.addReaction);
    const removeReaction = useReducer(reducers.removeReaction);
    const setTyping = useReducer(reducers.setTyping);
    const createRoom = useReducer(reducers.createRoom);
    const joinRoom = useReducer(reducers.joinRoom);
    const leaveRoom = useReducer(reducers.leaveRoom);
    const createDm = useReducer(reducers.createDm);
    const updateProfile = useReducer(reducers.updateProfile);
    const markRead = useReducer(reducers.markRead);

    // ── Table subscriptions ─────────────────────────────────────────────
    const [messages] = useTable(tables.message);
    const [reactions] = useTable(tables.reaction);
    const [rooms] = useTable(tables.room);
    const [roomMembers] = useTable(tables.room_member);

    const [onlineUsers] = useTable(
        tables.user.where((r) => r.online.eq(true)),
        {
            onInsert: (user) => {
                const name =
                    user.name || user.identity.toHexString().substring(0, 8);
                setSystemMessages((prev) => [
                    ...prev,
                    {
                        sender: Identity.zero(),
                        text: `${name} joined the chat`,
                        sent: Timestamp.now(),
                    },
                ]);
            },
            onDelete: (user) => {
                const name =
                    user.name || user.identity.toHexString().substring(0, 8);
                setSystemMessages((prev) => [
                    ...prev,
                    {
                        sender: Identity.zero(),
                        text: `${name} left the chat`,
                        sent: Timestamp.now(),
                    },
                ]);
            },
        },
    );
    const [offlineUsers] = useTable(
        tables.user.where((r) => r.online.eq(false)),
    );
    const users = useMemo(
        () => [...onlineUsers, ...offlineUsers],
        [onlineUsers, offlineUsers],
    );

    // ── Derived data ────────────────────────────────────────────────────
    const identityHex = identity?.toHexString() ?? "";

    // Auto-select first room the user is member of
    useEffect(() => {
        if (selectedRoomId !== null) return;
        const myMembership = roomMembers.find(
            (m) => m.userId.toHexString() === identityHex,
        );
        if (myMembership) {
            setSelectedRoomId(myMembership.roomId);
        }
    }, [roomMembers, identityHex, selectedRoomId]);

    const currentRoom = useMemo(
        () =>
            (selectedRoomId !== null
                ? rooms.find((r) => r.id === selectedRoomId)
                : null) ?? null,
        [rooms, selectedRoomId],
    );

    const isMember = useMemo(
        () =>
            selectedRoomId !== null &&
            roomMembers.some(
                (m) =>
                    m.roomId === selectedRoomId &&
                    m.userId.toHexString() === identityHex,
            ),
        [roomMembers, selectedRoomId, identityHex],
    );

    const roomMemberCount = useMemo(
        () =>
            selectedRoomId !== null
                ? roomMembers.filter((m) => m.roomId === selectedRoomId).length
                : 0,
        [roomMembers, selectedRoomId],
    );

    // DM room name: show the other user's name
    const currentRoomDisplay = useMemo(() => {
        if (!currentRoom) return null;
        if (!currentRoom.isDm) return currentRoom;
        const otherMember = roomMembers.find(
            (m) =>
                m.roomId === currentRoom.id &&
                m.userId.toHexString() !== identityHex,
        );
        const otherUser = otherMember
            ? users.find(
                  (u) =>
                      u.identity.toHexString() ===
                      otherMember.userId.toHexString(),
              )
            : null;
        return {
            ...currentRoom,
            name:
                otherUser?.name ||
                otherUser?.identity.toHexString().substring(0, 8) ||
                "DM",
        };
    }, [currentRoom, roomMembers, users, identityHex]);

    // Messages for current room
    const roomMessages = useMemo(
        () =>
            selectedRoomId !== null
                ? messages.filter((m) => m.roomId === selectedRoomId)
                : [],
        [messages, selectedRoomId],
    );

    const prettyMessages: PrettyMessage[] = useMemo(() => {
        const userMsgs = roomMessages.map((message) => {
            const user = users.find(
                (u) =>
                    u.identity.toHexString() === message.sender.toHexString(),
            );
            // Find reply context
            let replyToText: string | undefined;
            let replyToSenderName: string | undefined;
            if (message.replyToId !== undefined && message.replyToId !== null) {
                const replyMsg = messages.find(
                    (m) => m.id === message.replyToId,
                );
                if (replyMsg) {
                    replyToText = replyMsg.text;
                    const replyUser = users.find(
                        (u) =>
                            u.identity.toHexString() ===
                            replyMsg.sender.toHexString(),
                    );
                    replyToSenderName =
                        replyUser?.name ||
                        replyMsg.sender.toHexString().substring(0, 8);
                }
            }
            return {
                id: message.id,
                roomId: message.roomId,
                senderName:
                    user?.name || message.sender.toHexString().substring(0, 8),
                senderAvatarUrl: user?.avatarUrl ?? undefined,
                text: message.text,
                sent: message.sent,
                kind: "user" as const,
                senderIdentity: message.sender.toHexString(),
                editedAt: message.editedAt ?? undefined,
                replyToId: message.replyToId ?? undefined,
                replyToText,
                replyToSenderName,
                imageUrl: message.imageUrl ?? undefined,
            };
        });
        const sysMsgs = systemMessages.map((sm) => ({
            senderName: "system",
            text: sm.text,
            sent: sm.sent,
            kind: "system" as const,
            senderIdentity: sm.sender.toHexString(),
            roomId: 0n,
        }));
        return [...userMsgs, ...sysMsgs].sort((a, b) =>
            a.sent.toDate() > b.sent.toDate() ? 1 : -1,
        );
    }, [roomMessages, messages, users, systemMessages]);

    // Unread counts
    const unreadCounts = useMemo(() => {
        const counts = new Map<string, number>();
        const myMemberships = roomMembers.filter(
            (m) => m.userId.toHexString() === identityHex,
        );
        for (const membership of myMemberships) {
            const roomMsgs = messages.filter(
                (m) => m.roomId === membership.roomId,
            );
            const unread = roomMsgs.filter(
                (m) => m.id > membership.lastReadMessageId,
            ).length;
            if (unread > 0) {
                counts.set(membership.roomId.toString(), unread);
            }
        }
        return counts;
    }, [roomMembers, messages, identityHex]);

    // ── Reactions ───────────────────────────────────────────────────────
    const getReactionsForMessage = useCallback(
        (messageId: bigint): ReactionGroup[] => {
            const msgReactions = reactions.filter(
                (r) => r.messageId === messageId,
            );
            const groups = new Map<
                string,
                { count: number; reacted: boolean }
            >();
            for (const r of msgReactions) {
                const existing = groups.get(r.emoji) || {
                    count: 0,
                    reacted: false,
                };
                existing.count++;
                if (
                    identity &&
                    r.sender.toHexString() === identity.toHexString()
                ) {
                    existing.reacted = true;
                }
                groups.set(r.emoji, existing);
            }
            return Array.from(groups.entries()).map(([emoji, data]) => ({
                emoji,
                ...data,
            }));
        },
        [reactions, identity],
    );

    // ── Typing users ────────────────────────────────────────────────────
    const typingUsers = onlineUsers.filter(
        (u) =>
            u.typing &&
            identity &&
            u.identity.toHexString() !== identity.toHexString(),
    );

    // ── Auto-scroll ─────────────────────────────────────────────────────
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [prettyMessages.length]);

    // ── Mark read on room switch or new messages ────────────────────────
    useEffect(() => {
        if (!selectedRoomId || !isMember) return;
        const roomMsgs = messages.filter((m) => m.roomId === selectedRoomId);
        if (roomMsgs.length === 0) return;
        const maxId = roomMsgs.reduce(
            (max, m) => (m.id > max ? m.id : max),
            0n,
        );
        const membership = roomMembers.find(
            (m) =>
                m.roomId === selectedRoomId &&
                m.userId.toHexString() === identityHex,
        );
        if (membership && maxId > membership.lastReadMessageId) {
            markRead({ roomId: selectedRoomId, messageId: maxId });
        }
    }, [
        selectedRoomId,
        messages,
        roomMembers,
        identityHex,
        isMember,
        markRead,
    ]);

    // ── User info ───────────────────────────────────────────────────────
    const currentUser = useMemo(
        () =>
            identity
                ? users.find((u) => u.identity.isEqual(identity))
                : undefined,
        [users, identity],
    );
    const name =
        currentUser?.name || identity?.toHexString().substring(0, 8) || "";

    // ── Handlers ────────────────────────────────────────────────────────
    const handleSendMessage = async (text: string, imageUrl?: string) => {
        if (!selectedRoomId) return;
        if (isTypingRef.current) {
            isTypingRef.current = false;
            setTyping({ typing: false });
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        await sendMessage({
            roomId: selectedRoomId,
            text,
            replyToId: replyTo?.id,
            imageUrl,
        });
        setReplyTo(null);
    };

    const handleTyping = useCallback(() => {
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            setTyping({ typing: true });
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            setTyping({ typing: false });
            typingTimeoutRef.current = null;
        }, 3000);
    }, [setTyping]);

    const handleToggleReaction = useCallback(
        async (messageId: bigint, emoji: string) => {
            const msgReactions = reactions.filter(
                (r) => r.messageId === messageId,
            );
            const existing = msgReactions.find(
                (r) =>
                    r.emoji === emoji &&
                    identity &&
                    r.sender.toHexString() === identity.toHexString(),
            );
            if (existing) {
                await removeReaction({ messageId, emoji });
            } else {
                await addReaction({ messageId, emoji });
            }
        },
        [reactions, identity, addReaction, removeReaction],
    );

    const handleEditMessage = useCallback(
        async (messageId: bigint, newText: string) => {
            await editMessage({ messageId, newText });
        },
        [editMessage],
    );

    const handleDeleteMessage = useCallback(
        async (messageId: bigint) => {
            await deleteMessage({ messageId });
        },
        [deleteMessage],
    );

    const handleCreateRoom = useCallback(
        (roomName: string) => {
            createRoom({ name: roomName });
        },
        [createRoom],
    );

    const handleJoinRoom = useCallback(() => {
        if (selectedRoomId) joinRoom({ roomId: selectedRoomId });
    }, [joinRoom, selectedRoomId]);

    const handleCreateDm = useCallback(
        (targetHex: string) => {
            const targetUser = users.find(
                (u) => u.identity.toHexString() === targetHex,
            );
            if (targetUser) {
                createDm({ targetIdentity: targetUser.identity });
            }
        },
        [createDm, users],
    );

    const handleUpdateProfile = useCallback(
        (bio: string, avatarUrl: string) => {
            updateProfile({
                bio: bio || undefined,
                avatarUrl: avatarUrl || undefined,
            });
        },
        [updateProfile],
    );

    const handleSelectRoom = useCallback((roomId: bigint) => {
        setSelectedRoomId(roomId);
        setReplyTo(null);
        setShowSearch(false);
    }, []);

    const handleGoToMessage = useCallback((messageId: bigint) => {
        setShowSearch(false);
        const el = messageRefs.current.get(messageId.toString());
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("ring-2", "ring-primary/50", "rounded-lg");
            setTimeout(
                () =>
                    el.classList.remove(
                        "ring-2",
                        "ring-primary/50",
                        "rounded-lg",
                    ),
                2000,
            );
        }
    }, []);

    const onSubmitNewName = () => {
        if (newName.trim() === "") return;
        setSettingName(false);
        setName({ name: newName });
    };

    // ── Profile target user ─────────────────────────────────────────────
    const profileUser = useMemo(() => {
        const target = profileTarget || (showOwnProfile ? identityHex : null);
        if (!target) return null;
        return users.find((u) => u.identity.toHexString() === target) ?? null;
    }, [profileTarget, showOwnProfile, users, identityHex]);

    // ── Loading state ───────────────────────────────────────────────────
    if (!connected || !identity) {
        return (
            <div className="flex items-center justify-center h-dvh bg-background text-foreground">
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
                        <Loader2 className="h-12 w-12 text-primary animate-spin relative" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Spacetime Chat
                    </h1>
                </div>
            </div>
        );
    }

    // ── Sidebar (rendered identically for desktop & mobile sheet) ──────
    const sidebarContent = (
        <ChatSidebar
            rooms={rooms}
            roomMembers={roomMembers}
            users={users}
            selectedRoomId={selectedRoomId}
            currentIdentity={identityHex}
            currentUserName={name}
            currentAvatarUrl={currentUser?.avatarUrl}
            unreadCounts={unreadCounts}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={handleCreateRoom}
            onCreateDm={handleCreateDm}
            onEditName={() => {
                setSettingName(true);
                setNewName(name);
            }}
            onOpenProfile={() => setShowOwnProfile(true)}
        />
    );

    return (
        <div className="flex h-dvh bg-background text-foreground overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 shrink-0">
                {sidebarContent}
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-muted/5 relative">
                {/* Header */}
                <ChatHeader
                    room={currentRoomDisplay}
                    memberCount={roomMemberCount}
                    currentUserName={name}
                    settingName={settingName}
                    newName={newName}
                    onNewNameChange={setNewName}
                    onSubmitName={onSubmitNewName}
                    onEditName={() => {
                        setSettingName(true);
                        setNewName(name);
                    }}
                    onCancelEditName={() => setSettingName(false)}
                    onToggleSearch={() => setShowSearch(!showSearch)}
                    onToggleProfile={() => setShowOwnProfile(true)}
                    onJoinRoom={handleJoinRoom}
                    isMember={isMember}
                    sidebarContent={sidebarContent}
                />

                {/* Search overlay */}
                {showSearch && (
                    <MessageSearch
                        messages={prettyMessages}
                        onClose={() => setShowSearch(false)}
                        onGoToMessage={handleGoToMessage}
                    />
                )}

                {/* Message List */}
                <ScrollArea className="flex-1">
                    <div className="max-w-4xl mx-auto w-full flex flex-col px-4 py-6">
                        {prettyMessages.length === 0 ? (
                            <EmptyState roomName={currentRoomDisplay?.name} />
                        ) : (
                            prettyMessages.map((message, idx) => {
                                const isMe =
                                    message.kind !== "system" &&
                                    message.senderIdentity ===
                                        identity?.toHexString();
                                const showAvatar =
                                    idx === 0 ||
                                    prettyMessages[idx - 1].senderIdentity !==
                                        message.senderIdentity ||
                                    prettyMessages[idx - 1].kind === "system";

                                return (
                                    <div
                                        key={
                                            message.id?.toString() ??
                                            `sys-${idx}`
                                        }
                                        ref={(el) => {
                                            if (
                                                el &&
                                                message.id !== undefined
                                            ) {
                                                messageRefs.current.set(
                                                    message.id.toString(),
                                                    el,
                                                );
                                            }
                                        }}
                                        className="transition-all duration-300"
                                    >
                                        <ChatMessage
                                            message={message}
                                            isMe={isMe}
                                            showAvatar={showAvatar}
                                            reactions={
                                                message.id !== undefined
                                                    ? getReactionsForMessage(
                                                          message.id,
                                                      )
                                                    : []
                                            }
                                            onToggleReaction={
                                                message.id !== undefined
                                                    ? (emoji) =>
                                                          handleToggleReaction(
                                                              message.id!,
                                                              emoji,
                                                          )
                                                    : undefined
                                            }
                                            onEdit={
                                                isMe && message.id !== undefined
                                                    ? (newText) =>
                                                          handleEditMessage(
                                                              message.id!,
                                                              newText,
                                                          )
                                                    : undefined
                                            }
                                            onDelete={
                                                isMe && message.id !== undefined
                                                    ? () =>
                                                          handleDeleteMessage(
                                                              message.id!,
                                                          )
                                                    : undefined
                                            }
                                            onReply={
                                                message.id !== undefined &&
                                                isMember
                                                    ? () =>
                                                          setReplyTo({
                                                              id: message.id!,
                                                              senderName:
                                                                  message.senderName,
                                                              text: message.text,
                                                          })
                                                    : undefined
                                            }
                                            onClickSender={
                                                message.senderIdentity
                                                    ? () =>
                                                          setProfileTarget(
                                                              message.senderIdentity!,
                                                          )
                                                    : undefined
                                            }
                                        />
                                    </div>
                                );
                            })
                        )}
                        <div ref={scrollRef} className="h-4" />
                    </div>
                </ScrollArea>

                {/* Message Input */}
                <ChatInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    typingUsers={typingUsers.map(
                        (u) =>
                            u.name || u.identity.toHexString().substring(0, 8),
                    )}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    disabled={!isMember}
                />
            </main>

            {/* Profile Card Modal */}
            {profileUser && (
                <UserProfileCard
                    name={
                        profileUser.name ||
                        profileUser.identity.toHexString().substring(0, 8)
                    }
                    identity={profileUser.identity.toHexString()}
                    bio={profileUser.bio}
                    avatarUrl={profileUser.avatarUrl}
                    online={profileUser.online}
                    isOwnProfile={
                        profileUser.identity.toHexString() === identityHex
                    }
                    onUpdateProfile={
                        profileUser.identity.toHexString() === identityHex
                            ? handleUpdateProfile
                            : undefined
                    }
                    onClose={() => {
                        setProfileTarget(null);
                        setShowOwnProfile(false);
                    }}
                    onStartDm={
                        profileUser.identity.toHexString() !== identityHex
                            ? () => {
                                  handleCreateDm(
                                      profileUser.identity.toHexString(),
                                  );
                                  setProfileTarget(null);
                              }
                            : undefined
                    }
                />
            )}
        </div>
    );
}

export default App;
