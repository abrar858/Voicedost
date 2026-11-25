import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Projects" };

export default function DashboardPage() {
  // [ACCOUNTS] list the user's projects (table: projects) and minutes left
  return (
    <ComingSoon
      title="Your projects"
      description="Once accounts are live, every voiceover you make is saved here."
      items={["Recent projects with play and download", "Minutes used and left this month", "Duplicate a project to make a new version"]}
    />
  );
}
