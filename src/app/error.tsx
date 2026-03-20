"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error)
  }, [error])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0A0A",
        color: "#ffffff",
        fontFamily: "sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#888", marginBottom: 24, fontSize: 14 }}>
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          style={{
            background: "#FAD03F",
            color: "#0A0A0A",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
