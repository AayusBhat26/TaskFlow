"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next-intl/client";
import Link from "next/link";

const availableRoutesWithTranslation = [
  "dashboard",
  "settings",
  "security",
  "theme",
];

interface Props {
  addManualRoutes?: {
    name: string;
    href: string;
    useTranslate?: boolean;
    emoji?: string;
  }[];
  workspaceHref?: string;
}

export const BreadcrumbNav = ({ addManualRoutes, workspaceHref }: Props) => {
  const paths = usePathname();
  const pathNames = paths
    .split("/")
    .filter(
      (path) => path !== "te" && path !== "workspace" && path.trim() !== ""
    );
  const t = useTranslations("ROUTES");

  if (pathNames.length > 1) {
    return (
      <>
        {addManualRoutes ? (
          <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center">
            {addManualRoutes.map((route, i) => {
              return (
                <div
                  className="flex items-center sm:gap-0.5 text-sm sm:text-base"
                  key={i}
                >
                  {i + 1 < addManualRoutes.length ? (
                    <>
                      <Link
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md sm:px-2 px-1 py-1 transition-colors duration-200 hover:bg-accent"
                        href={route.href}
                      >
                        {route.useTranslate ? t(route.name) : route.name}
                      </Link>
                      <ChevronRight className="text-primary" />
                    </>
                  ) : (
                    <p className="font-bold text-primary sm:px-2 px-1">
                      {route.emoji && route.emoji}
                      {route.useTranslate ? t(route.name) : route.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-0.5 text-sm sm:text-base sm:flex-row sm:items-center">
            {pathNames.map((link, i) => {
              const href = `/${pathNames.slice(0, i + 1).join("/")}`;
              return (
                <div className="flex flex-wrap items-center gap-0.5" key={i}>
                  {i + 1 < pathNames.length ? (
                    <>
                      <Link
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md sm:px-2 px-1 py-1 transition-colors duration-200 hover:bg-accent"
                        href={
                          workspaceHref && pathNames.length - 1
                            ? workspaceHref
                            : href
                        }
                      >
                        {availableRoutesWithTranslation.includes(link)
                          ? t(link.toUpperCase())
                          : link}
                      </Link>
                      <ChevronRight className="text-primary" />
                    </>
                  ) : (
                    <p className="font-bold text-primary sm:px-2 px-1">
                      {availableRoutesWithTranslation.includes(link)
                        ? t(link.toUpperCase())
                        : link}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }
};
