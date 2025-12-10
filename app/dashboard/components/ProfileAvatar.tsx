"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { number } from "zod";

const WEB3_PALETTES = [
  { from: "#FF8F71", to: "#EF2D1A" },
  { from: "#7F7FD5", to: "#91EAE4" },
  { from: "#4776E6", to: "#8E54E9" },
  { from: "#00F5A0", to: "#00D9F5" },
  { from: "#FF6B6B", to: "#556270" },
  { from: "#FFD700", to: "#FF8C00" },
  { from: "#7303c0", to: "#ec38bc" },
  { from: "#38ef7d", to: "#11998e" },
  { from: "#FC466B", to: "#3F5EFB" },
  { from: "#1ed7b5", to: "#f0c808" },
];

const PATTERN_TYPES = ["gradient", "geometric", "rings"] as const;

interface Web3AvatarProps {
  id: string | number; // <-- changed from address
  size?: "sm" | "md" | "lg" | "xl";
  pattern?: (typeof PATTERN_TYPES)[number];
}

const ProfileAvatar = ({
  id,
  size = "md",
  pattern = "gradient",
}: Web3AvatarProps) => {
  // Numeric compatible hashing
  const getIndex = (value: string) =>
    value.split("").reduce((a, b) => a + b.charCodeAt(0), 0) %
    WEB3_PALETTES.length;

  const { from, to } = WEB3_PALETTES[getIndex(String(id))];
  const filtredId = isNaN(Number(id)) ? 666666 : id;

  // Deterministic avatar seed using Dicebear
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${filtredId}`;

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  // Pattern generator
  const getPattern = () => {
    switch (pattern) {
      case "geometric":
        return {
          backgroundImage: `
            linear-gradient(135deg, ${from} 25%, transparent 25%),
            linear-gradient(225deg, ${from} 25%, transparent 25%),
            linear-gradient(45deg, ${to} 25%, transparent 25%),
            linear-gradient(315deg, ${to} 25%, transparent 25%)
          `,
          backgroundSize: "50% 50%",
        };
      case "rings":
        return {
          background: `radial-gradient(circle, ${from}, ${to})`,
        };
      default:
        return {
          background: `linear-gradient(to bottom right, ${from}, ${to})`,
        };
    }
  };

  return (
    <Avatar className={`${sizeClasses[size]} ring-2 ring-white/10 rounded-lg`}>
      {/* square shape -> rounded-lg instead of rounded-full */}
      <AvatarFallback
        className="rounded-lg overflow-hidden"
        style={getPattern()}
      >
        <img
          src={avatarUrl}
          className="h-full w-full object-cover rounded-lg"
          alt="Generated Avatar"
        />
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
