import { useIntersection } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

export const useIsVisible = () => {
  const item = useRef<null | HTMLElement>(null);

  const [isVisible, setIsVisible] = useState(false);

  const { entry, ref } = useIntersection({
    root: item.current,
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [entry]);

  return {
    isVisible,
    ref,
  };
};
