import type { Timestamp } from "spacetimedb";

export type PrettyMessage = {
    id?: bigint;
    roomId: bigint;
    senderName: string;
    senderAvatarUrl?: string;
    text: string;
    sent: Timestamp;
    kind: "system" | "user";
    senderIdentity?: string;
    editedAt?: Timestamp;
    replyToId?: bigint;
    replyToText?: string;
    replyToSenderName?: string;
    imageUrl?: string;
};

export type ReactionGroup = {
    emoji: string;
    count: number;
    reacted: boolean;
};
