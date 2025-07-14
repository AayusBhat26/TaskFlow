"use client";

import { createContext, useContext, useState } from "react";

interface Props {
  children: React.ReactNode;
}

interface AutosaveIndicatorContext {
  status: "unsaved" | "saved" | "pending";
  onSetStatus: (status: "unsaved" | "saved" | "pending") => void;
}

export const AutosaveIndicatorCtx =
  createContext<AutosaveIndicatorContext | null>(null);

export const AutosaveIndicatorProvider = ({ children }: Props) => {
  const [status, setStatus] = useState<"unsaved" | "saved" | "pending">(
    "saved"
  );

  const onSetStatus = (status: "unsaved" | "saved" | "pending") => {
    setStatus(status);
  };

  return (
    <AutosaveIndicatorCtx.Provider value={{ status, onSetStatus }}>
      {children}
    </AutosaveIndicatorCtx.Provider>
  );
};

export const useAutosaveIndicator = () => {
  const ctx = useContext(AutosaveIndicatorCtx);
  if (!ctx) throw new Error("invalid use");

  return ctx;
};
