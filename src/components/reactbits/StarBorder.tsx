"use client";

import React from "react";
import "./StarBorder.css";

interface StarBorderProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  className?: string;
  innerClassName?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  children?: React.ReactNode;
}

const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = "div",
  className = "",
  innerClassName = "",
  color = "var(--accent, #a855f7)",
  speed = "6s",
  thickness = 1,
  backgroundColor,
  textColor,
  borderColor,
  children,
  style,
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px`,
        ...style,
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 12%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 12%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={`star-border-inner-content ${innerClassName}`}
        style={{
          background: backgroundColor,
          color: textColor,
          borderColor: borderColor,
        }}
      >
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
