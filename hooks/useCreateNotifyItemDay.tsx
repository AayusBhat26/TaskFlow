"use client";

import { NotifyType, UserPermission } from "@prisma/client";
import { useTranslations } from "next-intl";

export const useCreateNotifyItemDay = (
  notifyType: NotifyType,
  newUserRole: UserPermission | null,
  workspace: {
    id: string;
    name: string;
  } | null,
  taskId: string | null,
  mindMapId: string | null
) => {
  const t = useTranslations("NOTIFICATIONS.NOTIFY_ITEM");

  let link = "";
  let textContent = "";

  switch (notifyType) {
    case "NEW_USER_IN_WORKSPACE":
      link = `/dashboard/workspace/${workspace?.id}`;
      textContent = t("NEW_USER_IN_WORKSPACE_TEXT", { name: workspace?.name });
      break;
    case "USER_LEFT_WORKSPACE":
      link = `/dashboard/workspace/${workspace?.id}`;
      textContent = t("USER_LEFT_WORKSPACE_TEXT", { name: workspace?.name });
      break;
    case "NEW_TASK":
      link = `/dashboard/workspace/${workspace?.id}/tasks/task/${taskId}`;
      textContent = t("NEW_TASK_TEXT", { name: workspace?.name });
      break;
    case "NEW_MIND_MAP":
      link = `/dashboard/workspace/${workspace?.id}/mind-maps/mind-map/${mindMapId}`;
      textContent = t("NEW_MIND_MAP_TEXT", { name: workspace?.name });
      break;
    case "NEW_ROLE":
      let role =
        newUserRole === "ADMIN"
          ? t("ROLES.ADMIN")
          : newUserRole === "CAN_EDIT"
          ? t("ROLES.CAN_EDIT")
          : t("ROLES.READ_ONLY");
      link = `/dashboard/workspace/${workspace?.id}`;
      textContent = t("NEW_USER_IN_WORKSPACE_TEXT", {
        name: workspace?.name,
        role,
      });
    case "NEW_ASSIGNMENT_TASK":
      link = `/dashboard/workspace/${workspace?.id}/tasks/task/${taskId}`;
      textContent = t("NEW_ASSIGNMENT_TASK_TEXT", { name: workspace?.name });
      break;
    case "NEW_ASSIGNMENT_MIND_MAP":
      link = `/dashboard/workspace/${workspace?.id}/mind-maps/mind-map/${mindMapId}`;
      textContent = t("NEW_ASSIGNMENT_MIND_MAP_TEXT", {
        name: workspace?.name,
      });
      break;
    default:
      break;
  }

  return {
    link,
    textContent,
  };
};
