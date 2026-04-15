"use client";

import { useState } from "react";

interface IHoverButtonProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const HoverButton = ({ children, style = {}, onClick }: IHoverButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const finalStyle: React.CSSProperties = {
    ...style,
    color: isHovered ? "grey" : (style.color || "black"),
    transition: "color 0.2s ease",
  };

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={finalStyle}
    >
      {children}
    </button>
  );
};

export default HoverButton;