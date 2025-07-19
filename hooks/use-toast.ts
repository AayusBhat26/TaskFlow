// "use client"

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

import { useToastContext } from "@/context/ToastContext";

function useToast() {
  return useToastContext();
}

export { useToast };
// removed leftover 'as const' from old code
