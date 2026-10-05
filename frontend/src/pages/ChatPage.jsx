import { useWallpaper } from "../context/wallpaper";
import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import { useSelectedConversation } from "../hooks/useSelectedConversation";
import { useEffect } from "react";
import ChatSidebar from "../components/chat/ChatSidebar";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { ChatComposer } from "../components/chat/ChatComposer";
import { GroupChatView } from "../components/chat/GroupChatView";
import { useMediaQuery } from "../hooks/useMediaQuery";

function ChatPage() {
    const { frameStyle } = useWallpaper();

    // DM state
    const getConversations = useChatStore((state) => state.getConversations);
    const getMessages = useChatStore((state) => state.getMessages);
    const getUsers = useChatStore((state) => state.getUsers);
    const subscribeToMessages = useChatStore((state) => state.subscribeToMessages);
    const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);

    const { activeConversation, activeConversationId } = useSelectedConversation();

    // Group state
    const getGroups = useGroupStore((state) => state.getGroups);
    const activeGroupId = useGroupStore((state) => state.activeGroupId);
    const groups = useGroupStore((state) => state.groups);
    const setActiveGroupId = useGroupStore((state) => state.setActiveGroupId);
    const subscribeToGroupMessages = useGroupStore((state) => state.subscribeToGroupMessages);
    const unsubscribeFromGroupMessages = useGroupStore((state) => state.unsubscribeFromGroupMessages);

    const isLargeScreen = useMediaQuery("(min-width: 1024px)");

    const activeGroup = groups.find((g) => g._id === activeGroupId) ?? null;

    // Load DMs + users + groups on mount
    useEffect(() => {
        getUsers();
        getConversations();
        getGroups();
    }, [getConversations, getUsers, getGroups]);

    // Subscribe to group socket events
    useEffect(() => {
        subscribeToGroupMessages();
        return () => unsubscribeFromGroupMessages();
    }, [subscribeToGroupMessages, unsubscribeFromGroupMessages]);

    // Load DM messages when conversation changes
    useEffect(() => {
        if (!activeConversationId) return;
        getMessages(activeConversationId);
        subscribeToMessages(activeConversationId);
        return () => unsubscribeFromMessages();
    }, [getMessages, activeConversationId, subscribeToMessages, unsubscribeFromMessages]);

    const hasActiveChat = activeConversationId || activeGroupId;

    return (
        <div className="flex h-dvh flex-col overflow-hidden p-2 sm:p-3 md:p-8" style={frameStyle}>
            <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border border-border bg-background text-foreground">
                <ChatSidebar />

                {/* Right panel */}
                {activeGroup ? (
                    // Group chat view
                    <GroupChatView
                        group={activeGroup}
                        isLargeScreen={isLargeScreen}
                        onBack={() => setActiveGroupId(null)}
                    />
                ) : (
                    // DM chat view (original)
                    <div
                        className={`flex-1 flex-col overflow-hidden ${!isLargeScreen && !activeConversationId ? "hidden lg:flex" : "flex"
                            }`}
                    >
                        <ChatHeader />
                        <MessageList />
                        {activeConversation ? <ChatComposer /> : null}
                    </div>
                )}
            </div>
        </div>
    );
}
export default ChatPage;