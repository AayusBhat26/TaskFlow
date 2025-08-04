import { clsx, type ClassValue } from "clsx";
import { CalendarDays, Clock, Home, Star, User, MessageSquare, FileText, Code, Target, Trophy } from "lucide-react";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import { array } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const pathsToSoundEffects = {
  ANALOG: "/music/analog.mp3",
  BELL: "/music/bell.mp3",
  BIRD: "/music/bird.mp3",
  CHURCH_BELL: "/music/churchBell.mp3",
  DIGITAL: "/music/digital.mp3",
  FANCY: "/music/fancy.mp3",
} as const;

export const topSidebarLinks = [
  {
    href: "/dashboard",
    Icon: Home,
    hoverTextKey: "HOME_HOVER",
  },
  {
    href: "/dashboard/notes",
    Icon: FileText,
    hoverTextKey: "NOTES_HOVER",
  },
  {
    href: "/dashboard/pomodoro",
    include: "/dashboard/pomodoro",
    Icon: Clock,
    hoverTextKey: "POMODORO_HOVER",
  },
  {
    href: "/dashboard/calendar",
    Icon: CalendarDays,
    hoverTextKey: "CALENDAR_HOVER",
  },
  {
    href: "/dashboard/starred",
    Icon: Star,
    hoverTextKey: "STARRED_HOVER",
  },
  {
    href: "/dashboard/chat",
    Icon: MessageSquare,
    hoverTextKey: "CHAT_HOVER",
  },
  {
    href: "/dsa",
    Icon: Target,
    hoverTextKey: "DSA_HOVER",
  },
  {
    href: "/gaming",
    Icon: Trophy,
    hoverTextKey: "GAMING_HOVER",
  },
  {
    href: "/dashboard/assigned-to-me",
    Icon: User,
    hoverTextKey: "ASSIGNED_TO_ME_HOVER",
  },
];

export const getMonth = (month = dayjs().month()) => {
  const year = dayjs().year();

  const firstDayOfMonth = dayjs(new Date(year, month, 1)).day();

  let currentMonthCount = 1 - firstDayOfMonth;

  const daysMatrix = new Array(5).fill([]).map((_, weekIdx) => {
    return new Array(7).fill(null).map((_, dayIdx) => {
      currentMonthCount++;
      const date = dayjs(new Date(year, month, currentMonthCount));
      return {
        date,
        mapIndex: { weekIdx, dayIdx }
      };
    });
  });

  if (firstDayOfMonth === 1) {
    const firstWeek = daysMatrix[0];
    const previousMonth = month === 0 ? 11 : month - 1;
    const previousYear = month === 0 ? year - 1 : year;
    const lastDayOfPreviousMonth = dayjs(
      new Date(year, previousMonth + 1, 0)
    ).date();

    for (let i = 7 - firstWeek.length; i > 0; i--) {
      const day = lastDayOfPreviousMonth - i + 1;
      // Always return an object with date and mapIndex
      firstWeek.unshift({
        date: dayjs(new Date(previousYear, previousMonth, day)),
        mapIndex: { weekIdx: 0, dayIdx: i - 1 }
      });
    }
  }

  return daysMatrix;
};

export const scrollToHash = (elementId: string) => {
  const element = document.getElementById(elementId);
  element?.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
};
