export const useChangeLocale = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (nextLocale: string) => {
    setIsLoading(true);
    startTransition(() => {
      const segments = pathname.split("/");

      // If the first segment is a known locale, replace it
      if (segments.length > 1 && ["en", "te"].includes(segments[1])) {
        segments[1] = nextLocale;
      } else {
        segments.splice(1, 0, nextLocale);
      }

      const newPath = segments.join("/") || "/";
      router.replace(newPath);
    });
  };

  return { isLoading, isPending, onSelectChange };
};
