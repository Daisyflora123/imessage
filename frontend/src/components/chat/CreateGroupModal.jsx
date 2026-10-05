import { Avatar, Button, TextArea } from "@heroui/react";
import { CameraIcon, PlusIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useGroupStore } from "../../store/useGroupStore";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getInitials } from "../../hooks/useSelectedConversation";

export function CreateGroupModal({ onClose, onCreated }) {
    const users = useChatStore((state) => state.users);
    const authUser = useAuthStore((state) => state.authUser);
    const createGroup = useGroupStore((state) => state.createGroup);
    const isCreatingGroup = useGroupStore((state) => state.isCreatingGroup);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [picFile, setPicFile] = useState(null);
    const picInputRef = useRef(null);

    // Exclude the logged-in user from the list (they're auto-added as admin)
    const eligibleUsers = users.filter((u) => u._id !== authUser?._id);

    function toggleMember(id) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }

    function handlePicChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setPicFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) return;

        const group = await createGroup({
            name,
            description,
            memberIds: selectedIds,
            groupPicFile: picFile,
        });

        if (group) {
            onCreated?.(group);
            onClose();
        }
    }

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="text-lg font-bold">New Group</h2>
                    <Button variant="ghost" isIconOnly size="sm" onPress={onClose} aria-label="Close">
                        <XIcon className="size-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
                        {/* Group picture */}
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={() => picInputRef.current?.click()}
                                className="group relative size-20 overflow-hidden rounded-full border-2 border-dashed border-border bg-surface transition hover:border-accent"
                                aria-label="Upload group photo"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="" className="size-full object-cover" />
                                ) : (
                                    <CameraIcon className="absolute inset-0 m-auto size-7 text-muted group-hover:text-accent" />
                                )}
                            </button>
                            <input
                                ref={picInputRef}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handlePicChange}
                            />
                            <p className="text-xs text-muted">Group photo (optional)</p>
                        </div>

                        {/* Group name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold" htmlFor="group-name">
                                Group Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                id="group-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Weekend Plans"
                                maxLength={60}
                                required
                                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition"
                            />
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold" htmlFor="group-description">
                                Description <span className="text-muted font-normal">(optional)</span>
                            </label>
                            <textarea
                                id="group-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this group about?"
                                maxLength={200}
                                rows={2}
                                className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent transition"
                            />
                        </div>

                        {/* Members picker */}
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold">
                                Add Members{" "}
                                {selectedIds.length > 0 && (
                                    <span className="font-normal text-accent">({selectedIds.length} selected)</span>
                                )}
                            </p>
                            <div className="flex max-h-48 flex-col overflow-y-auto rounded-xl border border-border">
                                {eligibleUsers.length === 0 ? (
                                    <p className="px-4 py-3 text-sm text-muted">No other users found.</p>
                                ) : (
                                    eligibleUsers.map((user) => {
                                        const isSelected = selectedIds.includes(user._id);
                                        return (
                                            <button
                                                key={user._id}
                                                type="button"
                                                onClick={() => toggleMember(user._id)}
                                                className={`flex items-center gap-3 border-b border-border px-3 py-2.5 text-left transition last:border-b-0 ${isSelected ? "bg-accent-soft" : "hover:bg-surface"}`}
                                            >
                                                <Avatar className="size-9 shrink-0">
                                                    <Avatar.Image src={user.profilePic} alt={user.fullName} />
                                                    <Avatar.Fallback className="text-xs font-medium">
                                                        {getInitials(user.fullName)}
                                                    </Avatar.Fallback>
                                                </Avatar>
                                                <span className="flex-1 truncate text-sm font-medium">{user.fullName}</span>
                                                <span
                                                    className={`size-5 shrink-0 rounded-full border-2 transition ${isSelected ? "border-accent bg-accent" : "border-border"}`}
                                                    aria-hidden
                                                />
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-5 py-3">
                        <Button variant="ghost" onPress={onClose} type="button">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            isDisabled={!name.trim() || isCreatingGroup}
                            isLoading={isCreatingGroup}
                        >
                            <PlusIcon className="size-4" />
                            Create Group
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
