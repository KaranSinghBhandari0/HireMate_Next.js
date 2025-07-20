"use client";
import { X } from "lucide-react";
import Image from "next/image";

export default function DefaultAvatars({ setShowAvatarSelector, setImagePreview, setSelectedAvatar }) {
    const avatars = [
        { avatarUrl: '/no-user.png' },
        { avatarUrl: '/default-avatars/boy.png' },
        { avatarUrl: '/default-avatars/girl.png' },
        { avatarUrl: '/default-avatars/hacker.png' },
        { avatarUrl: '/default-avatars/human.png' },
        { avatarUrl: '/default-avatars/man.png' },
        { avatarUrl: '/default-avatars/lady.png' },
        { avatarUrl: '/default-avatars/profile.png' },
        { avatarUrl: '/default-avatars/woman.png' },
    ];

    const handleSelect = (avatar) => {
        setImagePreview(avatar.avatarUrl);
        setSelectedAvatar(avatar.avatarUrl);
        setShowAvatarSelector(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[95%] max-w-md relative">
                <button
                    onClick={() => setShowAvatarSelector(false)}
                    className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
                >
                    <X />
                </button>

                <h2 className="text-lg font-semibold mb-4 text-center">Choose an Avatar</h2>

                <div className="flex flex-wrap justify-center gap-12">
                    {avatars.map((avatar, idx) => (
                        <div
                            key={idx}
                            className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden cursor-pointer transition-transform transform hover:scale-110 hover:shadow-lg"
                            onClick={() => handleSelect(avatar)}
                        >
                            <Image
                                src={avatar.avatarUrl}
                                alt={`Avatar ${idx + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
