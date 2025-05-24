import { useQuery } from "@tanstack/react-query";
import { useTicketsQuery } from "../ticket/query";
import { useArtifactsQuery } from "../artifact/query";
import { getAllTasks } from "../task/axios";

interface ProjectStats {
  projectName: string;
  taskCount: number;
  artifactCount: number;
  ticketCount: number;
}

// Custom hook to get project stats
export function useProjectStats(projectName: string) {
  const ticketsQuery = useTicketsQuery(projectName);
  const artifactsQuery = useArtifactsQuery(projectName);
  
  // Get tasks count using a custom query
  const tasksQuery = useQuery(
    ["tasks", projectName], 
    () => getAllTasks(projectName)
  );
  
  const taskCount = tasksQuery.data?.data?.length || 0;
  const artifactCount = artifactsQuery.data?.data?.length || 0;
  const ticketCount = ticketsQuery.data?.data?.length || 0;
  
  return {
    taskCount,
    artifactCount,
    ticketCount,
    isLoading: tasksQuery.isLoading || artifactsQuery.isLoading || ticketsQuery.isLoading,
    isError: tasksQuery.isError || artifactsQuery.isError || ticketsQuery.isError,
  };
}

// Hook to get stats for multiple projects in parallel
export function useAllProjectStats(projectNames: string[]) {
  // Create a custom tasks query for all projects
  const tasksQueries = useQuery(
    ["all-tasks"], 
    async () => {
      // Create a map to store counts by project name
      const taskCounts: Record<string, number> = {};
      
      // Fetch tasks for each project in parallel
      await Promise.all(
        projectNames.map(async (projectName) => {
          try {
            const response = await getAllTasks(projectName);
            taskCounts[projectName] = response.data?.length || 0;
          } catch (err) {
            console.error(`Error fetching tasks for ${projectName}:`, err);
            taskCounts[projectName] = 0;
          }
        })
      );
      
      return taskCounts;
    },
    {
      enabled: projectNames.length > 0
    }
  );
  
  // Get artifact counts using a custom query
  const artifactQueries = useQuery(
    ["all-artifacts"], 
    async () => {
      // Create a map to store counts by project name
      const artifactCounts: Record<string, number> = {};
      
      // Fetch artifacts for each project in parallel
      await Promise.all(
        projectNames.map(async (projectName) => {
          try {
            const module = await import("../artifact/axios");
            const response = await module.getAllArtifacts(projectName);
            artifactCounts[projectName] = response.data?.length || 0;
          } catch (err) {
            console.error(`Error fetching artifacts for ${projectName}:`, err);
            artifactCounts[projectName] = 0;
          }
        })
      );
      
      return artifactCounts;
    },
    {
      enabled: projectNames.length > 0
    }
  );
  
  const taskCounts = tasksQueries.data || {};
  const artifactCounts = artifactQueries.data || {};
  
  const isLoading = tasksQueries.isLoading || artifactQueries.isLoading;
  const isError = tasksQueries.isError || artifactQueries.isError;
  
  return {
    taskCounts,
    artifactCounts,
    isLoading,
    isError,
  };
}
