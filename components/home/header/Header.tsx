"use client";
import { homePageHeaderImgs, homePageHeaderLinks } from "@/lib/constants";
import { HeaderLink } from "./HeaderLink";
import { VideoContainer } from "../video/VideoContainer";
import { ImagesCarousel } from "../carousel/ImagesCarousel";
import { useIsVisible } from "@/hooks/useIsVisible";

export const Header = () => {
  const { isVisible, ref } = useIsVisible();
  return (
    <header className="flex flex-col items-center mt-20 w-full relative isolate group">
      <h1
        ref={ref}
        className="font-bold text-5xl sm:text-6xl lg:text-8xl max-w-2xl text-center"
      >
        Your Ultimate Productive App
      </h1>
      <div className="w-full flex flex-wrap items-center justify-center mt-12 gap-2 sm:gap-4">
        {homePageHeaderLinks.map((link, i) => (
          <HeaderLink
            key={i}
            Icon={link.Icon}
            href={link.href}
            title={link.title}
          />
        ))}
      </div>

      <ImagesCarousel
        images={homePageHeaderImgs}
        className="mt-28 h-[40rem] z-20 relative bg-background"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className={`relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#e74b4b] to-[#a50505]  sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] group-hover:opacity-80 dark:group-hover:opacity-60 transition-opacity duration-500 ${
            isVisible
              ? "opacity:80 dark:opacity-60"
              : "opacity-40 dark:opacity-30"
          }`}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-36 "
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className={`relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#e74b4b] to-[#a50505]  sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] group-hover:opacity-80 dark:group-hover:opacity-60 transition-opacity duration-500 ${
            isVisible
              ? "opacity:80 dark:opacity-60"
              : "opacity-40 dark:opacity-30"
          }`}
        />
      </div>
    </header>
  );
};
