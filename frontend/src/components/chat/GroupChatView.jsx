import { Avatar, Button } from "@heroui/react";
import { ChevronLeftIcon, LogOutIcon, UsersIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../../store/useGroupStore";
import { useChatStore } from "../../store/useChatStore";
import { GroupMessageBubble } from "./GroupMessageBubble";
import { GroupComposer } from "./GroupComposer";
import { getInitials } from "../../hooks/useSelectedConversation";
import useScrollToBottom from "../../hooks/useScrollToBottom";

export function GroupChatView({ group, onBack, isLargeScreen }) {
    const groupMessages = useGroupStore((state) => state.groupMessages);
    const isGroupMessagesLoading = useGroupStore((state) => state.isGroupMessagesLoading);
    const getGroupMessages = useGroupStore((state) => state.getGroupMessages);
    const leaveGroup = useGroupStore((state) => state.leaveGroup);
    const setActiveGroupId = useGroupStore((state) => state.setActiveGroupId);

    const [showMembers, setShowMembers] = useState(false);

    const lastMsgId = groupMessages.at(-1)?._id;
    const scrollRef = useScrollToBottom(group._id, lastMsgId);

    useEffect(() => {
        getGroupMessages(group._id);
    }, [group._id, getGroupMessages]);

    async function handleLeave() {
        if (!window.confirm(`Leave "${group.name}"?`)) return;
        await leaveGroup(group._id);
        onBack?.();
    }

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center gap-1 border-b border-border px-1.5 py-1.5 sm:gap-2 sm:px-2 sm:py-2">
                {!isLargeScreen && (
                    <Button variant="ghost" size="sm" isIconOnly className="shrink-0" onPress={onBack}>
                        <ChevronLeftIcon className="size-6" strokeWidth={2.25} />
                    </Button>
                )}

                {/* Group avatar */}
                <Avatar className="size-9 shrink-0">
                    <Avatar.Image src={group.groupPic} alt={group.name} />
                    <Avatar.Fallback className="text-sm font-medium">
                        {getInitials(group.name)}
                    </Avatar.Fallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <p className="truncate text-[15px] font-semibold leading-tight">{group.name}</p>
                    <p className="truncate text-xs text-muted">{group.members.length} members</p>
                </div>

                <div className="ml-auto flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        className="shrink-0"
                        aria-label="Show members"
                        onPress={() => setShowMembers((v) => !v)}
                    >
                        <UsersIcon className="size-5" strokeWidth={2} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        className="shrink-0 text-destructive"
                        aria-label="Leave group"
                        onPress={handleLeave}
                    >
                        <LogOutIcon className="size-5" strokeWidth={2} />
                    </Button>
                </div>
            </header>

            {/* Members panel (slide-in) */}
            {showMembers && (
                <div className="shrink-0 border-b border-border bg-surface px-4 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Members</p>
                    <div className="flex flex-wrap gap-2">
                        {group.members.map((member) => (
                            <div key={member._id} className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1">
                                <Avatar className="size-5 shrink-0">
                                    <Avatar.Image src={member.profilePic} alt={member.fullName} />
                                    <Avatar.Fallback className="text-[9px]">{getInitials(member.fullName)}</Avatar.Fallback>
                                </Avatar>
                                <span className="text-xs font-medium">{member.fullName}</span>
                                {String(member._id) === String(group.admin?._id ?? group.admin) && (
                                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                                        Admin
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Message list */}
            <div className="relative flex flex-1 flex-col overflow-hidden">
                {isGroupMessagesLoading ? (
                    <div className="flex flex-1 items-center justify-center">
                        <span className="text-sm text-muted">Loading messages…</span>
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4"
                    >
                        <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
                            {group.name}
                        </p>
                        {groupMessages.length === 0 ? (
                            <p className="text-center text-sm text-muted">No messages yet. Say hi! 👋</p>
                        ) : (
                            groupMessages.map((msg) => (
                                <GroupMessageBubble key={msg._id} message={msg} />
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Composer */}
            <GroupComposer groupId={group._id} />
        </div>
    );
}
