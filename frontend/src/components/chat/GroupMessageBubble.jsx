import { Avatar } from "@heroui/react";
import { withTransform } from "../../lib/imagekit";
import { MessageVideo } from "./MessageVideo";
import { getInitials } from "../../hooks/useSelectedConversation";
import { useAuthStore } from "../../store/useAuthStore";
import { formatMessageTime } from "../../lib/utils";

const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

export function GroupMessageBubble({ message }) {
    const authUser = useAuthStore((state) => state.authUser);

    const isOwnMessage = String(message.senderId?._id ?? message.senderId) === String(authUser?._id);
    const sender = message.senderId; // populated object from backend
    const senderName = sender?.fullName ?? "Unknown";
    const senderPic = sender?.profilePic ?? "";
    const senderInitials = senderName ? getInitials(senderName) : "?";

    const hasImage = Boolean(message.image);
    const hasVideo = Boolean(message.video);
    const time = formatMessageTime(message.createdAt);

    return (
        <div className={`flex w-full items-end gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
            {/* Sender avatar — only shown for others' messages */}
            {!isOwnMessage && (
                <Avatar className="mb-1 size-7 shrink-0 self-end">
                    <Avatar.Image src={senderPic} alt={senderName} />
                    <Avatar.Fallback className="text-[10px] font-medium">{senderInitials}</Avatar.Fallback>
                </Avatar>
            )}

            <div className={`flex max-w-[min(80%,26rem)] flex-col gap-0.5 ${isOwnMessage ? "items-end" : "items-start"}`}>
                {/* Sender name for others */}
                {!isOwnMessage && (
                    <p className="px-1 text-[11px] font-semibold text-accent">{senderName}</p>
                )}

                <div
                    className={`rounded-2xl px-3 py-2 text-[15px] leading-snug sm:px-3.5 ${
                        isOwnMessage
                            ? "rounded-br-md bg-accent text-accent-foreground"
                            : "rounded-bl-md bg-surface"
                    }`}
                >
                    {hasImage && (
                        <img
                            src={withTransform(message.image, IMAGE_TRANSFORM)}
                            alt=""
                            className="mb-1.5 max-h-40 max-w-full rounded-lg object-cover sm:max-h-52 sm:rounded-xl"
                        />
                    )}
                    {hasVideo && <MessageVideo src={message.video} />}
                    {message.text && (
                        <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
                    )}
                    <p className={`mt-1 text-[11px] tabular-nums ${isOwnMessage ? "text-accent-foreground/75" : "text-muted"}`}>
                        {time}
                    </p>
                </div>
            </div>
        </div>
    );
}
