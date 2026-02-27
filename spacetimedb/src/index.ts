// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────
import { schema, t, table, SenderError } from "spacetimedb/server";

// ─────────────────────────────────────────────────────────────────────────────
// TABLES
// ─────────────────────────────────────────────────────────────────────────────

const user = table(
    { name: "user", public: true },
    {
        identity: t.identity().primaryKey(),
        name: t.string().optional(),
        online: t.bool(),
        typing: t.bool(),
        bio: t.string().optional(),
        avatarUrl: t.string().optional(),
    },
);

const room = table(
    { name: "room", public: true },
    {
        id: t.u64().primaryKey().autoInc(),
        name: t.string(),
        isDm: t.bool(),
        createdBy: t.identity(),
        createdAt: t.timestamp(),
    },
);

const room_member = table(
    {
        name: "room_member",
        public: true,
        indexes: [
            {
                name: "room_member_room_id",
                accessor: "roomId",
                algorithm: "btree" as const,
                columns: ["roomId"],
            },
            {
                name: "room_member_user_id",
                accessor: "userId",
                algorithm: "btree" as const,
                columns: ["userId"],
            },
        ],
    },
    {
        id: t.u64().primaryKey().autoInc(),
        roomId: t.u64(),
        userId: t.identity(),
        joinedAt: t.timestamp(),
        lastReadMessageId: t.u64(),
    },
);

const message = table(
    {
        name: "message",
        public: true,
        indexes: [
            {
                name: "message_room_id",
                accessor: "roomId",
                algorithm: "btree" as const,
                columns: ["roomId"],
            },
            {
                name: "message_sender",
                accessor: "sender",
                algorithm: "btree" as const,
                columns: ["sender"],
            },
        ],
    },
    {
        id: t.u64().primaryKey().autoInc(),
        roomId: t.u64(),
        sender: t.identity(),
        sent: t.timestamp(),
        text: t.string(),
        editedAt: t.timestamp().optional(),
        replyToId: t.u64().optional(),
        imageUrl: t.string().optional(),
    },
);

const reaction = table(
    {
        name: "reaction",
        public: true,
        indexes: [
            {
                name: "reaction_message_id",
                accessor: "messageId",
                algorithm: "btree" as const,
                columns: ["messageId"],
            },
        ],
    },
    {
        id: t.u64().primaryKey().autoInc(),
        messageId: t.u64(),
        sender: t.identity(),
        emoji: t.string(),
    },
);

const spacetimedb = schema({ user, room, room_member, message, reaction });
export default spacetimedb;

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

function validateName(name: string) {
    if (!name) throw new SenderError("Names must not be empty");
}

function validateMessage(text: string) {
    if (!text) throw new SenderError("Messages must not be empty");
}

function requireRoomMember(ctx: any, roomId: bigint) {
    for (const m of ctx.db.room_member.iter()) {
        if (m.roomId !== roomId) continue;
        if (m.userId.toHexString() === ctx.sender.toHexString()) return m;
    }
    throw new SenderError("You are not a member of this room");
}

// ─────────────────────────────────────────────────────────────────────────────
// USER REDUCERS
// ─────────────────────────────────────────────────────────────────────────────

export const set_name = spacetimedb.reducer(
    { name: t.string() },
    (ctx, { name }) => {
        validateName(name);
        const user = ctx.db.user.identity.find(ctx.sender);
        if (!user) throw new SenderError("Cannot set name for unknown user");
        ctx.db.user.identity.update({ ...user, name });
    },
);

export const update_profile = spacetimedb.reducer(
    { bio: t.string().optional(), avatarUrl: t.string().optional() },
    (ctx, { bio, avatarUrl }) => {
        const user = ctx.db.user.identity.find(ctx.sender);
        if (!user) throw new SenderError("Unknown user");
        ctx.db.user.identity.update({ ...user, bio, avatarUrl });
    },
);

export const set_typing = spacetimedb.reducer(
    { typing: t.bool() },
    (ctx, { typing }) => {
        const user = ctx.db.user.identity.find(ctx.sender);
        if (!user) throw new SenderError("Unknown user");
        ctx.db.user.identity.update({ ...user, typing });
    },
);

// ─────────────────────────────────────────────────────────────────────────────
// ROOM REDUCERS
// ─────────────────────────────────────────────────────────────────────────────

export const create_room = spacetimedb.reducer(
    { name: t.string() },
    (ctx, { name }) => {
        if (!name) throw new SenderError("Room name must not be empty");
        const row = ctx.db.room.insert({
            id: 0n,
            name,
            isDm: false,
            createdBy: ctx.sender,
            createdAt: ctx.timestamp,
        });
        // Creator auto-joins
        ctx.db.room_member.insert({
            id: 0n,
            roomId: row.id,
            userId: ctx.sender,
            joinedAt: ctx.timestamp,
            lastReadMessageId: 0n,
        });
    },
);

export const join_room = spacetimedb.reducer(
    { roomId: t.u64() },
    (ctx, { roomId }) => {
        const rm = ctx.db.room.id.find(roomId);
        if (!rm) throw new SenderError("Room not found");
        if (rm.isDm) throw new SenderError("Cannot join a DM room");
        // Check not already member
        for (const m of ctx.db.room_member.iter()) {
            if (m.roomId !== roomId) continue;
            if (m.userId.toHexString() === ctx.sender.toHexString()) {
                throw new SenderError("Already a member");
            }
        }
        ctx.db.room_member.insert({
            id: 0n,
            roomId,
            userId: ctx.sender,
            joinedAt: ctx.timestamp,
            lastReadMessageId: 0n,
        });
    },
);

export const leave_room = spacetimedb.reducer(
    { roomId: t.u64() },
    (ctx, { roomId }) => {
        const membership = requireRoomMember(ctx, roomId);
        ctx.db.room_member.id.delete(membership.id);
    },
);

export const create_dm = spacetimedb.reducer(
    { targetIdentity: t.identity() },
    (ctx, { targetIdentity }) => {
        if (ctx.sender.toHexString() === targetIdentity.toHexString()) {
            throw new SenderError("Cannot create DM with yourself");
        }
        // Check if DM already exists between these two users
        for (const m of ctx.db.room_member.iter()) {
            if (m.userId.toHexString() !== ctx.sender.toHexString()) continue;
            const rm = ctx.db.room.id.find(m.roomId);
            if (rm && rm.isDm) {
                for (const m2 of ctx.db.room_member.iter()) {
                    if (m2.roomId !== m.roomId) continue;
                    if (
                        m2.userId.toHexString() === targetIdentity.toHexString()
                    ) {
                        return; // DM already exists
                    }
                }
            }
        }
        const target = ctx.db.user.identity.find(targetIdentity);
        if (!target) throw new SenderError("Target user not found");
        const row = ctx.db.room.insert({
            id: 0n,
            name: "",
            isDm: true,
            createdBy: ctx.sender,
            createdAt: ctx.timestamp,
        });
        ctx.db.room_member.insert({
            id: 0n,
            roomId: row.id,
            userId: ctx.sender,
            joinedAt: ctx.timestamp,
            lastReadMessageId: 0n,
        });
        ctx.db.room_member.insert({
            id: 0n,
            roomId: row.id,
            userId: targetIdentity,
            joinedAt: ctx.timestamp,
            lastReadMessageId: 0n,
        });
    },
);

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE REDUCERS
// ─────────────────────────────────────────────────────────────────────────────

export const send_message = spacetimedb.reducer(
    {
        roomId: t.u64(),
        text: t.string(),
        replyToId: t.u64().optional(),
        imageUrl: t.string().optional(),
    },
    (ctx, { roomId, text, replyToId, imageUrl }) => {
        if (!text && !imageUrl)
            throw new SenderError("Message must have text or image");
        requireRoomMember(ctx, roomId);
        ctx.db.message.insert({
            id: 0n,
            roomId,
            sender: ctx.sender,
            text: text || "",
            sent: ctx.timestamp,
            editedAt: undefined,
            replyToId,
            imageUrl,
        });
    },
);

export const edit_message = spacetimedb.reducer(
    { messageId: t.u64(), newText: t.string() },
    (ctx, { messageId, newText }) => {
        validateMessage(newText);
        const msg = ctx.db.message.id.find(messageId);
        if (!msg) throw new SenderError("Message not found");
        if (msg.sender.toHexString() !== ctx.sender.toHexString()) {
            throw new SenderError("Cannot edit another user's message");
        }
        ctx.db.message.id.update({
            ...msg,
            text: newText,
            editedAt: ctx.timestamp,
        });
    },
);

export const delete_message = spacetimedb.reducer(
    { messageId: t.u64() },
    (ctx, { messageId }) => {
        const msg = ctx.db.message.id.find(messageId);
        if (!msg) throw new SenderError("Message not found");
        if (msg.sender.toHexString() !== ctx.sender.toHexString()) {
            throw new SenderError("Cannot delete another user's message");
        }
        for (const r of ctx.db.reaction.iter()) {
            if (r.messageId !== messageId) continue;
            ctx.db.reaction.id.delete(r.id);
        }
        ctx.db.message.id.delete(messageId);
    },
);

export const mark_read = spacetimedb.reducer(
    { roomId: t.u64(), messageId: t.u64() },
    (ctx, { roomId, messageId }) => {
        const membership = requireRoomMember(ctx, roomId);
        if (messageId > membership.lastReadMessageId) {
            ctx.db.room_member.id.update({
                ...membership,
                lastReadMessageId: messageId,
            });
        }
    },
);

// ─────────────────────────────────────────────────────────────────────────────
// REACTION REDUCERS
// ─────────────────────────────────────────────────────────────────────────────

export const add_reaction = spacetimedb.reducer(
    { messageId: t.u64(), emoji: t.string() },
    (ctx, { messageId, emoji }) => {
        if (!emoji) throw new SenderError("Emoji must not be empty");
        const msg = ctx.db.message.id.find(messageId);
        if (!msg) throw new SenderError("Message not found");
        for (const r of ctx.db.reaction.iter()) {
            if (r.messageId !== messageId) continue;
            if (
                r.sender.toHexString() === ctx.sender.toHexString() &&
                r.emoji === emoji
            ) {
                throw new SenderError("Already reacted with this emoji");
            }
        }
        ctx.db.reaction.insert({
            id: 0n,
            messageId,
            sender: ctx.sender,
            emoji,
        });
    },
);

export const remove_reaction = spacetimedb.reducer(
    { messageId: t.u64(), emoji: t.string() },
    (ctx, { messageId, emoji }) => {
        for (const r of ctx.db.reaction.iter()) {
            if (r.messageId !== messageId) continue;
            if (
                r.sender.toHexString() === ctx.sender.toHexString() &&
                r.emoji === emoji
            ) {
                ctx.db.reaction.id.delete(r.id);
                return;
            }
        }
        throw new SenderError("Reaction not found");
    },
);

// ─────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

export const init = spacetimedb.init((ctx) => {
    // Create default "general" room
    const room = ctx.db.room.insert({
        id: 0n,
        name: "general",
        isDm: false,
        createdBy: ctx.sender,
        createdAt: ctx.timestamp,
    });
    console.info(`Created default room "general" with id ${room.id}`);
});

export const onConnect = spacetimedb.clientConnected((ctx) => {
    const user = ctx.db.user.identity.find(ctx.sender);
    if (user) {
        ctx.db.user.identity.update({ ...user, online: true, typing: false });
    } else {
        ctx.db.user.insert({
            name: undefined,
            identity: ctx.sender,
            online: true,
            typing: false,
            bio: undefined,
            avatarUrl: undefined,
        });
        // Auto-join general room (id=1 from init)
        // Find general room
        for (const rm of ctx.db.room.iter()) {
            if (rm.name === "general" && !rm.isDm) {
                // Check not already member
                let isMember = false;
                for (const m of ctx.db.room_member.iter()) {
                    if (m.roomId !== rm.id) continue;
                    if (m.userId.toHexString() === ctx.sender.toHexString()) {
                        isMember = true;
                        break;
                    }
                }
                if (!isMember) {
                    ctx.db.room_member.insert({
                        id: 0n,
                        roomId: rm.id,
                        userId: ctx.sender,
                        joinedAt: ctx.timestamp,
                        lastReadMessageId: 0n,
                    });
                }
                break;
            }
        }
    }
});

export const onDisconnect = spacetimedb.clientDisconnected((ctx) => {
    const user = ctx.db.user.identity.find(ctx.sender);
    if (user) {
        ctx.db.user.identity.update({ ...user, online: false, typing: false });
    } else {
        console.warn(
            `Disconnect event for unknown user with identity ${ctx.sender}`,
        );
    }
});
