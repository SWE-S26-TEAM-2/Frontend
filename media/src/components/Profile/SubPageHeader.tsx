import Image from "next/image";
import Link from "next/link";
import type { IUser } from "@/types/userProfile.types";

interface ISubPageHeaderProps {
  user: IUser;
  title: string;
}

export function SubPageHeader({ user, title }: ISubPageHeaderProps) {
  const initials = (user.displayName ?? user.username)[0].toUpperCase();
  return (
    <div className="bg-black">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-6">
        <Link href={`/${user.username}`} className="shrink-0">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center ring-2 ring-[#2a2a2a] hover:ring-[#ff5500] transition-all">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.username}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-4xl font-bold text-white select-none">
                {initials}
              </span>
            )}
          </div>
        </Link>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-2xl font-bold text-white">{title}</span>
          <Link
            href={`/${user.username}`}
            className="text-sm text-[#888] hover:text-white transition-colors no-underline"
          >
            {user.displayName ?? user.username}
          </Link>
        </div>
      </div>
    </div>
  );
}