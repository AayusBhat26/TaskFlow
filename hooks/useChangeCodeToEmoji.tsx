"use client";

import { changeCodeToEmoji } from "@/lib/changeCodeToEmoji";
import { useMemo } from "react";

export const useChangeCodeToEmoji = (...codes: string[]) => {
  const emojis = useMemo(() => {
    return codes.map((code) => {
      const result = changeCodeToEmoji(code);
      return result;
    });
  }, [codes]);

  return emojis.length === 0 ? emojis[0] : emojis;
};
