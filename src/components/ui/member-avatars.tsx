import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { cn } from "@/lib/utils";

export type Member = {
  name: string;
  avatarUrl?: string | null;
};

interface MemberAvatarsProps {
  members: Member[];
  size?: "sm" | "md" | "lg";
  limit?: number;
  className?: string;
  borderColor?: string;
}

export function MemberAvatars({
  members,
  size = "md",
  limit = 3,
  className,
  borderColor = "border-white",
}: MemberAvatarsProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-9 w-9 border-4",
    lg: "h-10 w-10 border-4",
  };

  const displayedMembers = (members || []).slice(0, limit);
  const remaining = (members || []).length - limit;

  if (!members || members.length === 0) return null;

  return (
    <TooltipProvider>
      <div className={cn("flex -space-x-3", className)}>
        {displayedMembers.map((member, index) => (
          <Tooltip key={`${member.name}-${index}`}>
            <TooltipTrigger asChild>
              <Avatar
                className={cn(
                  sizeClasses[size],
                  "rounded-full shadow-sm hover:z-10 transition-transform hover:scale-110",
                  borderColor,
                )}
              >
                <AvatarImage src={member.avatarUrl || ""} alt={member.name} />
                <AvatarFallback className="text-[10px] font-black bg-[#f6f3f1] text-[#2D241E]">
                  {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent className="bg-[#2D241E] text-white border-none rounded-xl">
              <p className="font-bold text-xs">{member.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {remaining > 0 && (
          <Avatar
            className={cn(
              sizeClasses[size],
              "rounded-full shadow-sm bg-[#f6f3f1] flex items-center justify-center",
              borderColor,
            )}
          >
            <AvatarFallback className="text-[10px] font-black text-[#2D241E]/50">
              +{remaining}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </TooltipProvider>
  );
}
