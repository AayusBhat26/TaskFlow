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
import { Section } from "./section/Section";
import { TextSection } from "./section/TextSection";
import { Footer } from "./footer/Footer";

export const HomePage = () => {
  return (
    <>
      <Nav />
      <CreativeHeader />
      <div className="w-full mx-auto max-w-screen-xl px-4 sm:px-6">
        <main>
          <TextSection
            title="Your Productivity Partner"
            desc="Maximize your team's efficiency with TaskFlow—an all-in-one workspace designed to consolidate your essential tools into one cohesive platform."
          />

          <Section
            id="Mind-Maps"
            title="Visualize with Mind Maps"
            desc="Mind Maps allow users to build visually compelling projects, making complex ideas easier to understand. The user-friendly interface offers extensive customization, enabling smooth navigation and collaboration through tagging and task assignment features."
            images={homePageMindMapsImgs}
            reverse
          />
          <Section
            id="Tasks"
            title="Tasks & Notes"
            desc="The Tasks feature provides a smooth environment for creating notes and organizing projects. With an enhanced editor and auto-save functionality, users can assign tasks, add categories, tag items, and set deadlines, all integrated seamlessly with the calendar for optimal organization."
            images={homePageTasksImgs}
          />
          <Section
            id="Roles"
            title="Roles & Permissions"
            desc="TaskFlow's role management system simplifies workspace oversight. Admins and owners can adjust user roles, manage account and workspace settings, and oversee permissions to ensure smooth collaboration."
            images={homePageRolesAndSettingsImgs}
          />
          <Section
            id="Pomodoro"
            title="Pomodoro Timer"
            desc="The built-in Pomodoro timer supports focused work sessions by letting users set custom session times, rounds, breaks, and alerts—tailoring the experience to each user's productivity needs."
            images={homePagePomodoroImgs}
            reverse
          />
          <TextSection
            title="The Future of Team Collaboration"
            desc="Effortlessly share projects and invite others to join with easy shareable links. TaskFlow enables instant project review and collaboration with team members from anywhere."
          />

          <Section
            id="Calendar"
            title="Unified Calendar"
            desc="Stay organized with the Unified Calendar, where all scheduled tasks and deadlines are displayed. It enhances teamwork by ensuring everyone has clear visibility of project timelines and due dates."
            images={homePageCalendarImgs}
            reverse
          />

          <Section
            id="Filters"
            title="Quick Access"
            desc="Instantly locate what you need with a smart search feature, quick access tabs, and filtering tools. Tagging and marking essential items make it easy to keep your most important projects just a click away, streamlining your workflow."
            images={homePageAssignmentFilterAndStarredImgs}
          />
        </main>
      </div>
      <Footer />
    </>
  );
};
