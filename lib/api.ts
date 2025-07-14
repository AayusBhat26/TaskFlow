import {
  ExtendedMindMap,
  ExtendedTask,
  HomeRecentActivity,
  SettingsWorkspace,
} from "@/types/extended";
import { ExtendedWorkspace } from "@/types/chat";
import {
  MindMap,
  PomodoroSettings,
  UserPermission,
  Workspace,
} from "@prisma/client";
import { notFound } from "next/navigation";
import { ACTIVITY_PER_PAGE } from "./constants";

export const domain =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "http://localhost:3000";

export const getWorkspace = async (workspace_id: string, userId: string) => {
  const res = await fetch(
    `${domain}/api/workspace/get/workspace_details/${workspace_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<Workspace>;
};

export const getWorkspaces = async (userId: string) => {
  const res = await fetch(
    `${domain}/api/workspace/get/user_workspaces?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json() as Promise<Workspace[]>;
};

export const getUserAdminWorkspaces = async (userId: string) => {
  const res = await fetch(
    `${domain}/api/workspace/get/user_admin_workspaces?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return [];
  }

  return res.json() as Promise<Workspace[]>;
};

export const getWorkspaceSettings = async (
  workspace_id: string,
  userId: string
) => {
  const res = await fetch(
    `${domain}/api/workspace/get/settings/${workspace_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<SettingsWorkspace>;
};

export const getUserWorkspaceRole = async (
  workspace_id: string,
  userId: string
) => {
  const res = await fetch(
    `${domain}/api/workspace/get/user_role?workspaceId=${workspace_id}&userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  return res.json() as Promise<UserPermission>;
};

export const getTask = async (task_id: string, userId: string) => {
  const res = await fetch(
    `${domain}/api/task/get/details/${task_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<ExtendedTask>;
};

export const getMindMap = async (mind_map_id: string, userId: string) => {
  const res = await fetch(
    `${domain}/api/mind_maps/get/details/${mind_map_id}?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<ExtendedMindMap>;
};

export const getUserPomodoroSettings = async (userId: string) => {
  const res = await fetch(
    `${domain}/api/pomodoro/get_settings?userId=${userId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<PomodoroSettings>;
};

export const getInitialHomeRecentActivity = async (userId: string) => {
  const res = await fetch(
    `${domain}/api/home-page/get?userId=${userId}&page=${1}&take=${ACTIVITY_PER_PAGE}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<HomeRecentActivity[]>;
};

export const getWorkspaceWithChat = async (workspace_id: string, userId: string) => {
  const res = await fetch(
    `${domain}/api/workspace/get/workspace_details/${workspace_id}?userId=${userId}&includeChat=true`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return notFound();
  }

  return res.json() as Promise<ExtendedWorkspace>;
};

export const getConversation = async (workspaceId: string, userId?: string) => {
  const url = new URL(`${domain}/api/chat/${workspaceId}`);
  if (userId) {
    url.searchParams.set('userId', userId);
  }
  
  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    // Return null instead of throwing error to handle gracefully
    console.warn(`Failed to fetch conversation for workspace ${workspaceId}: ${res.status}`);
    return null;
  }

  return res.json();
};

export const sendMessage = async (data: {
  conversationId: string;
  content: string;
  messageType?: "TEXT" | "SYSTEM";
  replyToId?: string;
}) => {
  const res = await fetch(
    `${domain}/api/chat/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
};

export const addMessageReaction = async (messageId: string, emoji: string) => {
  const res = await fetch(
    `${domain}/api/chat/reaction`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageId, emoji }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to add reaction");
  }

  return res.json();
};

export const removeMessageReaction = async (messageId: string, emoji: string) => {
  const res = await fetch(
    `${domain}/api/chat/reaction`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageId, emoji }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to remove reaction");
  }

  return res.json();
};
