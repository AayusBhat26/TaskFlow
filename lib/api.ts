import {
  ExtendedMindMap,
  ExtendedTask,
  ExtendedWorkspace,
  HomeRecentActivity,
  SettingsWorkspace,
} from "@/types/extended";
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
