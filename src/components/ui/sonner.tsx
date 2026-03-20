"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="h-4 w-4" />,
        info: <InfoIcon className="h-4 w-4" />,
        warning: <TriangleAlertIcon className="h-4 w-4" />,
        error: <OctagonXIcon className="h-4 w-4" />,
        loading: <Loader2Icon className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "rounded-lg border border-slate-800 bg-[#0f172a] text-slate-100",
          title: "text-sm font-medium",
          description: "text-xs text-slate-400",
          actionButton: "bg-green-600 text-white text-xs",
          cancelButton: "bg-slate-800 text-slate-300 text-xs",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
