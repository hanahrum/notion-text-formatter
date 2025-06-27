import React from "react";

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      style={{ width: "100%", padding: "8px", fontSize: "1rem" }}
      {...props}
    />
  );
}
