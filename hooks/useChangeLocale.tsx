"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export const useChangeLocale = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (nextLocale: "te" | "en") => {
    setIsLoading(true);
    startTransition(() => {
      // Replace the locale in the pathname (assuming the locale is the first segment)
      const segments = pathname.split("/");
      if (segments.length > 1 && (segments[1] === "te" || segments[1] === "en")) {
        segments[1] = nextLocale;
      } else {
        segments.splice(1, 0, nextLocale);
      }
      const newPath = segments.join("/");
      router.replace(newPath);
    });
  };

  return { isLoading, isPending, onSelectChange };
};
