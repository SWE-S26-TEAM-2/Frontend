"use client";

import { useState } from "react";

interface IHoverButtonProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string; 
  onClick?: () => void;
}

const HoverButton = ({ children, style = {}, className = "", onClick }: IHoverButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const finalStyle: React.CSSProperties = {
    ...style,
    color: isHovered ? "grey" : (style.color || undefined),
    transition: "color 0.2s ease",
    cursor: "pointer", 
  };

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={finalStyle}
      className={className} 
    >
      {children}
    </button>
  );
};

export default HoverButton;