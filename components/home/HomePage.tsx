import {
  homePageAssignmentFilterAndStarredImgs,
  homePageCalendarImgs,
  homePageMindMapsImgs,
  homePagePomodoroImgs,
  homePageRolesAndSettingsImgs,
  homePageTasksImgs,
} from "@/lib/constants";
import { CreativeHeader } from "./header/CreativeHeader";
import { Nav } from "./nav/Nav";
import { ModernSection } from "./section/ModernSection";
import { ModernTextSection } from "./section/ModernTextSection";
import { Footer } from "./footer/Footer";

export const HomePage = () => {
  return (
    <>
      <Nav />
      <CreativeHeader />
      <div className="w-full mx-auto max-w-screen-xl px-4 sm:px-6">
        <main>
          <ModernTextSection
            title="Your Productivity Partner"
            desc="Maximize your team's efficiency with TaskFlow—an all-in-one workspace designed to consolidate your essential features into one cohesive platform."
          />

          <ModernSection
            id="Mind-Maps"
            title="Visualize with Mind Maps"
            desc="Mind Maps allow users to build visually compelling features, making complex ideas easier to understand. The user-friendly interface offers extensive customization, enabling smooth navigation and collaboration through tagging and task assignment features."
            images={homePageMindMapsImgs}
            reverse
          />
          <ModernSection
            id="Tasks"
            title="Tasks & Notes"
            desc="The Tasks feature provides a smooth environment for creating notes and organizing features. With an enhanced editor and auto-save functionality, users can assign tasks, add categories, tag items, and set deadlines, all integrated seamlessly with the calendar for optimal organization."
            images={homePageTasksImgs}
          />
          <ModernSection
            id="Roles"
            title="Roles & Permissions"
            desc="TaskFlow's role management system simplifies workspace oversight. Admins and owners can adjust user roles, manage account and workspace settings, and oversee permissions to ensure smooth collaboration."
            images={homePageRolesAndSettingsImgs}
          />
          <ModernSection
            id="Pomodoro"
            title="Pomodoro Timer"
            desc="The built-in Pomodoro timer supports focused work sessions by letting users set custom session times, rounds, breaks, and alerts—tailoring the experience to each user's productivity needs."
            images={homePagePomodoroImgs}
            reverse
          />
          <ModernTextSection
            title="The Future of Team Collaboration"
            desc="Effortlessly share features and invite others to join with easy shareable links. TaskFlow enables instant feature review and collaboration with team members from anywhere."
          />

          <ModernSection
            id="Calendar"
            title="Unified Calendar"
            desc="Stay organized with the Unified Calendar, where all scheduled tasks and deadlines are displayed. It enhances teamwork by ensuring everyone has clear visibility of feature timelines and due dates."
            images={homePageCalendarImgs}
            reverse
          />

          <ModernSection
            id="Filters"
            title="Quick Access"
            desc="Instantly locate what you need with a smart search feature, quick access tabs, and filtering tools. Tagging and marking essential items make it easy to keep your most important features just a click away, streamlining your workflow."
            images={homePageAssignmentFilterAndStarredImgs}
          />
        </main>
      </div>
      <Footer />
    </>
  );
};
