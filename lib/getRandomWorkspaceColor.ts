import { CustomColors } from "@prisma/client";

export const colors = Object.values(CustomColors);

export const getRandomWorkspaceColor = () => {
  const colors: string[] = Object.values(CustomColors);
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex] as CustomColors;
};
