import { HomePageImage } from "@/types/extended";
import {
  CalendarDays,
  Clock,
  MessageSquare,
  PencilRuler,
  Workflow,
} from "lucide-react";

export const ACTIVITY_PER_PAGE = 8;
export const MESSAGES_LIMIT = 30;

export const homePageHeaderLinks = [
  {
    href: "Tasks",
    Icon: PencilRuler,
    title: "Tasks & Notes",
  },
  {
    href: "Mind-Maps",
    Icon: Workflow,
    title: "Mind Maps",
  },
  {
    href: "Calendar",
    Icon: CalendarDays,
    title: "Calendar",
  },
  {
    href: "Chat",
    Icon: MessageSquare,
    title: "Group Chat",
  },
  {
    href: "Pomodoro",
    Icon: Clock,
    title: "Pomodoro",
  },
];

export const navLinks = [
  {
    title: "Mind Maps",
    href: "Mind-Maps",
  },
  {
    title: "Tasks",
    href: "Tasks",
  },
  {
    href: "Calendar",
    title: "Integrated Calendar",
  },
  {
    href: "Chat",
    title: "Chat & notifications",
  },
  {
    href: "Pomodoro",
    title: "Pomodoro",
  },
  {
    href: "Roles",
    title: "Roles & Settings",
  },
];

export const homePageHeaderImgs: HomePageImage[] = [
  {
    src: "/images/dashboardBlack.png",
    alt: "Home page - dark theme",
  },
  {
    src: "/images/dashboardWhite.png",
    alt: "Home page - light theme",
  },
  {
    src: "/images/workspaceMainPage.png",
    alt: "Workspace main page - dark theme",
  },
  {
    src: "/images/workspaceMainPageFiltersBlack.png",
    alt: "Workspace main page - dark theme",
  },
  {
    src: "/images/workspaceMainPageFiltersWhite.png",
    alt: "Workspace main page - light theme",
  },
];

export const homePagePomodoroImgs: HomePageImage[] = [
  {
    src: "/images/pomodoroBlack.png",
    alt: "Pomodoro main page - dark theme",
  },
  {
    src: "/images/pomodoroWhite.png",
    alt: "Pomodoro main page - light theme",
  },
  {
    src: "/images/pomodoroSettingsBlack.png",
    alt: "Pomodoro settings page - dark theme",
  },
  {
    src: "/images/pomodoroSettingsWhite.png",
    alt: "Pomodoro settings page - dark theme",
  },
];

export const homePageMindMapsImgs: HomePageImage[] = [
  {
    src: "/images/mindMapEditBlack.png",
    alt: "MindMap Edit page - dark theme",
  },
  {
    src: "/images/mindMapEditWhite.png",
    alt: "MindMap Edit page - light theme",
  },
  {
    src: "/images/mindMapPreviewBlack.png",
    alt: "MindMap Preview page - dark theme",
  },
  {
    src: "/images/mindMapEditEdgeOptionsBlack.png",
    alt: "MindMap Edit Options page - dark theme",
  },
  {
    src: "/images/mindMapEditTagsBlack.png",
    alt: "MindMap Edit Tags page - light theme",
  },
  {
    src: "/images/mindMapPreviewWhite.png",
    alt: "MindMap Preview page - light theme",
  },
];

export const homePageTasksImgs: HomePageImage[] = [
  {
    src: "/images/taskContentBlack.png",
    alt: "Task Content page - dark theme",
  },
  {
    src: "/images/taskContentEditorOptionsBlack.png",
    alt: "Task Content editor options page - dark theme",
  },
  {
    src: "/images/taskContentAddImageByLinkBlack.png",
    alt: "Task Content Add Image by link page - dark theme",
  },
  {
    src: "/images/taskContentAddImageFromDeviceBlack.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
];

export const homePageChatImgs: HomePageImage[] = [
  {
    src: "/images/groupChat.png",
    alt: "Group page - dark theme",
  },
  {
    src: "/images/groupChatBlack.png",
    alt: "Task Content editor options page - dark theme",
  },
  {
    src: "/images/groupChatWhite.png",
    alt: "Task Content editor options page - dark theme",
  },
  {
    src: "/images/groupChatAndNotificationsBlack.png",
    alt: "Task Content Add Image by link page - dark theme",
  },
  {
    src: "/images/groupChatEditMessageBlack.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
  {
    src: "/images/groupChatFileUploadBlack.png",
    alt: "Task Content Add Image by link page - dark theme",
  },
  {
    src: "/images/groupChatFileViewBlack.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
  {
    src: "/images/groupChatNewMessageBlack.png",
    alt: "Task Content Add Image by link page - dark theme",
  },
  {
    src: "/images/groupChatNewMessageWhite.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
];

export const homePageCalendarImgs: HomePageImage[] = [
  {
    src: "/images/calendarPage.png",
    alt: "Task Content page - dark theme",
  },
  {
    src: "/images/calendarWhite.png",
    alt: "Task Content editor options page - dark theme",
  },
];

export const homePageAssignmentFilterAndStarredImgs: HomePageImage[] = [
  {
    src: "/images/assignedToMeBlack.png",
    alt: "Task Content page - dark theme",
  },
  {
    src: "/images/assignedToMeWhite.png",
    alt: "Task Content editor options page - dark theme",
  },
  {
    src: "/images/starredItemsBlack.png",
    alt: "Task Content Add Image by link page - dark theme",
  },
  {
    src: "/images/starredItemsWhite.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
];

export const homePageRolesAndSettingsImgs: HomePageImage[] = [
  {
    src: "/images/accountSettingsBlack.png",
    alt: "Task Content page - dark theme",
  },
  {
    src: "/images/accountSettingsWhite.png",
    alt: "Task Content editor options page - dark theme",
  },
  {
    src: "/images/accountSettingsWithImageBlack.png",
    alt: "Task Content Add Image by link page - dark theme",
  },
  {
    src: "/images/workspaceMembersBlack.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
  {
    src: "/images/workspaceSettingsBlack.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
  {
    src: "/images/uploadAccountImageBlack.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
  {
    src: "/images/createShortcutTaskBlack.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
  {
    src: "/images/createShortcutTaskWhite.png",
    alt: "Task Content Add Image from device page - dark theme",
  },
];
