import React from "react";

export function Button({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      style={{
        padding: "8px 12px",
        background: "#2563eb",
        color: "white",
        borderRadius: "4px",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
