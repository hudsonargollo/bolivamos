import fs from "node:fs/promises";
import path from "node:path";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import { redirect } from "next/navigation";
import HermesReportsClient from "./hermes-reports-client";

interface ReportItem {
  title: string;
  filename: string;
  relativePath: string;
  content: string;
  sizeBytes: number;
}

async function collectHermesReports(): Promise<ReportItem[]> {
  const rootDir = process.cwd(); // apps/web
  // We want to scan workspace root files or docs/
  const parentRootDir = path.resolve(rootDir, "../.."); // repository root /root/ClubeMkt/bolivibes

  const pathsToScan = [
    { file: "docs/landing-and-slidein-auth-specs.md", title: "Landing, Auth Drawer & Multilingual Spec" },
    { file: "AGENTS.md", title: "BoliVibes Agent Instructions & Monorepo Rules" },
    { file: "BRANDGUIDE/DESIGN-SYSTEM.md", title: "Sun-Mark Identity & Brand Design System" },
    { file: "docs/themed-maps/PRD-themed-interactive-maps.md", title: "Themed 3D OSM Interactive Maps PRD" },
    { file: "README.md", title: "Project README & Setup Guide" },
  ];

  const reports: ReportItem[] = [];

  for (const item of pathsToScan) {
    const fullPath = path.resolve(parentRootDir, item.file);
    try {
      const stats = await fs.stat(fullPath);
      const content = await fs.readFile(fullPath, "utf-8");
      reports.push({
        title: item.title,
        filename: path.basename(item.file),
        relativePath: item.file,
        content,
        sizeBytes: stats.size,
      });
    } catch {
      // Ignore if missing
    }
  }

  return reports;
}

export default async function HermesReportsPage() {
  const session = await getCurrentSessionRsc();
  if (!session || session.role !== "admin") redirect("/login");

  const isHudson = session.email?.toLowerCase() === "hudsonargollo@gmail.com";
  const reports = await collectHermesReports();

  return <HermesReportsClient reports={reports} isHudson={isHudson} email={session.email} />;
}
