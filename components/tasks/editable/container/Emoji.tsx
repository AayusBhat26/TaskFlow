"use client";

import { EmojiSelector } from "@/components/common/EmojiSelector";
import { useAutosaveIndicator } from "@/context/AutosaveIndicator";
import { useChangeCodeToEmoji } from "@/hooks/useChangeCodeToEmoji";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface Props {
  onFormSelect: (emoji: string) => void;
  emoji: string;
  taskId: string;
  workspaceId: string;
}

export const Emoji = ({ onFormSelect, emoji, taskId, workspaceId }: Props) => {
  const [selectedEmoji, setSelectedEmoji] = useState(emoji);
  const { status, onSetStatus } = useAutosaveIndicator();
  const renderedEmoji = useChangeCodeToEmoji(selectedEmoji);

  const { mutate: updateTaskEmoji, isPending } = useMutation({
    mutationFn: async () => {
      await axios.post("/api/task/update/emoji", {
        workspaceId,
        selectedEmoji,
        taskId,
      });
    },
    onSuccess: () => {
      onSetStatus("saved");
    },
    onError: () => {
      onSetStatus("unsaved");
    },
  });

  const selectEmojiHandler = (emoji: string) => {
    if (status !== "unsaved") onSetStatus("unsaved");
    setSelectedEmoji(emoji);
    onFormSelect(emoji);
    debounced();
  };

  const debounced = useDebouncedCallback(() => {
    onSetStatus("pending");
    updateTaskEmoji();
  }, 2000);

  return (
    <EmojiSelector onSelectedEmoji={selectEmojiHandler}>
      <span
        role="img"
        aria-label="emoji"
        className="w-16 h-16 rounded-lg bg-secondary flex justify-center items-center text-3xl"
      >
        {renderedEmoji}
      </span>
    </EmojiSelector>
  );
};
