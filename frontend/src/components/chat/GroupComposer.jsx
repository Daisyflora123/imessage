import { Button, TextArea } from "@heroui/react";
import { ImageIcon, LoaderIcon, SendHorizontalIcon } from "lucide-react";
import { useRef, useState } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";

export function GroupComposer({ groupId }) {
    const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);
    const isSendingGroupMessage = useGroupStore((state) => state.isSendingGroupMessage);
    const sendGroupMessage = useGroupStore((state) => state.sendGroupMessage);

    const [text, setText] = useState("");
    const mediaInputRef = useRef(null);
    const { playRandomKeyStrokeSound } = useKeyboardSound();

    function playSoundIfEnabled() {
        if (isSoundEnabled) playRandomKeyStrokeSound();
    }

    async function handleSend() {
        if (!text.trim()) return;
        const ok = await sendGroupMessage({ groupId, text: text.trim() });
        if (ok) {
            setText("");
            playSoundIfEnabled();
        }
    }

    async function handleMediaPick(e) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        const ok = await sendGroupMessage({ groupId, file });
        if (ok) playSoundIfEnabled();
    }

    return (
        <footer className="shrink-0 border-t border-border px-1.5 pb-2 pt-2 sm:px-2">
            {isSendingGroupMessage ? (
                <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
                    <LoaderIcon className="size-4 shrink-0 animate-spin text-accent" strokeWidth={2} aria-hidden />
                    <span className="truncate">Sending...</span>
                </div>
            ) : null}

            <div className="mx-auto flex w-full max-w-full items-end gap-1.5 px-0.5 sm:gap-2 sm:px-1">
                <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="sr-only"
                    disabled={isSendingGroupMessage}
                    tabIndex={-1}
                    aria-hidden
                    onChange={handleMediaPick}
                />
                <Button
                    variant="ghost"
                    isIconOnly
                    isDisabled={isSendingGroupMessage}
                    className="size-9 shrink-0 touch-manipulation self-end text-accent"
                    onPress={() => mediaInputRef.current?.click()}
                >
                    <ImageIcon className="size-5 sm:size-6" strokeWidth={2} />
                </Button>

                <TextArea
                    fullWidth
                    variant="secondary"
                    placeholder="iMessage"
                    rows={1}
                    value={text}
                    onChange={(e) => { setText(e.target.value); playSoundIfEnabled(); }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    className="flex-1 rounded-full"
                />

                <Button
                    variant="primary"
                    isIconOnly
                    isDisabled={!text.trim()}
                    onPress={handleSend}
                >
                    <SendHorizontalIcon className="size-5" />
                </Button>
            </div>
        </footer>
    );
}
