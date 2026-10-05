import { getInitials, useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { APP_NAME, AppLogo } from "../AppLogo";
import { UserButton } from "@clerk/react";

import { SearchField, Tabs, Avatar } from "@heroui/react";
import { MessageSquareIcon, PlusIcon, UsersIcon } from "lucide-react";
import { ConversationRow } from "./ConversationRow";
import { useState } from "react";
import { CreateGroupModal } from "./CreateGroupModal";

function mapUserForList(user, onlineUsers) {
    return {
        conversationId: user._id,
        id: user._id,
        name: user.fullName,
        avatarUrl: user.profilePic,
        initials: getInitials(user.fullName),
        isOnline: onlineUsers.includes(user._id),
        peer: {
            name: user.fullName,
            avatarUrl: user.profilePic,
            initials: getInitials(user.fullName),
            isOnline: onlineUsers.includes(user._id),
        },
    };
}

function ChatSidebar() {
    const conversations = useChatStore((state) => state.conversations);
    const users = useChatStore((state) => state.users);

    const searchQuery = useChatStore((state) => state.searchQuery);
    const setSearchQuery = useChatStore((state) => state.setSearchQuery);

    const sidebarTab = useChatStore((state) => state.sidebarTab);
    const setSidebarTab = useChatStore((state) => state.setSidebarTab);

    const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

    const onlineUsers = useAuthStore((state) => state.onlineUsers);

    const { activeConversationId, isLargeScreen } = useSelectedConversation();

    // Groups
    const groups = useGroupStore((state) => state.groups);
    const activeGroupId = useGroupStore((state) => state.activeGroupId);
    const setActiveGroupId = useGroupStore((state) => state.setActiveGroupId);

    const [showCreateGroup, setShowCreateGroup] = useState(false);

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const conversationUsers = (conversations || []).map((user) =>
        mapUserForList(user, onlineUsers)
    );

    const allUsers = (Array.isArray(users) ? users : []).map((user) =>
        mapUserForList(user, onlineUsers)
    );

    const filteredConversations = normalizedSearchQuery
        ? conversationUsers.filter((c) =>
            c.peer.name.toLowerCase().includes(normalizedSearchQuery)
        )
        : conversationUsers;

    const filteredUsers = normalizedSearchQuery
        ? allUsers.filter((u) => u.name.toLowerCase().includes(normalizedSearchQuery))
        : allUsers;

    const filteredGroups = normalizedSearchQuery
        ? groups.filter((g) => g.name.toLowerCase().includes(normalizedSearchQuery))
        : groups;

    // When user selects a group, clear DM selection and vice-versa
    function handleSelectGroup(groupId) {
        setActiveConversationId(null);
        setActiveGroupId(groupId);
    }

    function handleSelectConversation(id) {
        setActiveGroupId(null);
        setActiveConversationId(id);
    }

    const hasActiveConversation = activeConversationId || activeGroupId;

    return (
        <>
            <aside
                className={`w-full shrink-0 flex-col overflow-hidden border-r border-border lg:w-72 ${!isLargeScreen && hasActiveConversation ? "hidden lg:flex" : "flex"
                    }`}
            >
                <div className="shrink-0 border-b border-border px-2 pb-2 pt-2.5 sm:px-3 sm:pt-3">
                    <div className="flex items-center gap-2 px-0.5 sm:gap-2.5 sm:px-1">
                        <AppLogo size={32} className="size-8 shrink-0 rounded-[9px] sm:size-8.5" alt="" />
                        <p className="flex-1 truncate text-lg font-bold tracking-tight sm:text-[22px]">
                            {APP_NAME}
                        </p>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "size-8",
                                },
                            }}
                        />
                    </div>
                </div>

                <Tabs
                    selectedKey={sidebarTab}
                    onSelectionChange={(key) => setSidebarTab(String(key))}
                    variant="secondary"
                    className="flex flex-1 flex-col overflow-y-auto"
                >
                    <div className="shrink-0 border-b border-border px-3 pb-2 pt-2">
                        <SearchField
                            fullWidth
                            variant="secondary"
                            className="w-full"
                            value={searchQuery}
                            onChange={setSearchQuery}
                        >
                            <SearchField.Group className="rounded-xl">
                                <SearchField.SearchIcon />
                                <SearchField.Input placeholder="Search" />
                                {searchQuery ? <SearchField.ClearButton /> : null}
                            </SearchField.Group>
                        </SearchField>
                    </div>

                    <Tabs.ListContainer className="shrink-0 border-b border-border px-2 pb-2 pt-1">
                        <Tabs.List className="w-full gap-0.5">
                            <Tabs.Tab id="chats" className="flex-1 justify-center gap-1.5">
                                <MessageSquareIcon className="size-3.5 opacity-80" aria-hidden />
                                Chats
                            </Tabs.Tab>
                            <Tabs.Tab id="users" className="flex-1 justify-center gap-1.5">
                                <UsersIcon className="size-3.5 opacity-80" aria-hidden />
                                Users
                            </Tabs.Tab>
                            <Tabs.Tab id="groups" className="flex-1 justify-center gap-1.5">
                                <UsersIcon className="size-3.5 opacity-80" aria-hidden />
                                Groups
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>

                    {/* Chats tab */}
                    <Tabs.Panel
                        id="chats"
                        className="flex-1 overflow-x-hidden overflow-y-auto outline-none"
                    >
                        {filteredConversations.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-muted">
                                No conversations match your search.
                            </p>
                        ) : (
                            filteredConversations.map((conversation) => (
                                <ConversationRow
                                    key={conversation.id}
                                    user={conversation}
                                    selected={conversation.id === activeConversationId}
                                    onSelect={() => handleSelectConversation(conversation.id)}
                                />
                            ))
                        )}
                    </Tabs.Panel>

                    {/* Users tab */}
                    <Tabs.Panel id="users" className="flex-1 overflow-x-hidden overflow-y-auto outline-none">
                        {filteredUsers.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-muted">No people match your search.</p>
                        ) : (
                            filteredUsers.map((user) => (
                                <ConversationRow
                                    key={user.conversationId}
                                    user={user}
                                    selected={user.conversationId === activeConversationId}
                                    onSelect={() => handleSelectConversation(user.conversationId)}
                                />
                            ))
                        )}
                    </Tabs.Panel>

                    {/* Groups tab */}
                    <Tabs.Panel id="groups" className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto outline-none">
                        {/* Create group button */}
                        <button
                            type="button"
                            onClick={() => setShowCreateGroup(true)}
                            className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left text-accent transition hover:bg-accent-soft"
                        >
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                                <PlusIcon className="size-5 text-accent" />
                            </span>
                            <span className="text-[15px] font-semibold">New Group</span>
                        </button>

                        {filteredGroups.length === 0 ? (
                            <p className="px-4 py-6 text-center text-sm text-muted">
                                {searchQuery ? "No groups match your search." : "You're not in any groups yet."}
                            </p>
                        ) : (
                            filteredGroups.map((group) => (
                                <button
                                    key={group._id}
                                    type="button"
                                    onClick={() => handleSelectGroup(group._id)}
                                    className={`flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left transition ${activeGroupId === group._id ? "bg-accent-soft" : "hover:bg-surface"}`}
                                >
                                    <Avatar className="size-12 shrink-0">
                                        <Avatar.Image src={group.groupPic} alt={group.name} />
                                        <Avatar.Fallback className="text-sm font-medium">
                                            {getInitials(group.name)}
                                        </Avatar.Fallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[15px] font-semibold">{group.name}</p>
                                        <p className="truncate text-xs text-muted">{group.members.length} members</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </Tabs.Panel>
                </Tabs>
            </aside>

            {showCreateGroup && (
                <CreateGroupModal
                    onClose={() => setShowCreateGroup(false)}
                    onCreated={(group) => handleSelectGroup(group._id)}
                />
            )}
        </>
    );
}
export default ChatSidebar;