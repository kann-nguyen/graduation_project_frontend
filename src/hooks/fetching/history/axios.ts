import api from "~/api";
import { ActivityHistory } from ".";
import { PromiseServer } from "~/hooks/fetching/response-type";
export async function getHistoryByProject(
  projectName: string,
  username: string | undefined
): PromiseServer<ActivityHistory[]> {
  const urlEncodedProjectName = encodeURIComponent(projectName);
  if (!username) {
    const response = await api.get(`/activity/${urlEncodedProjectName}`);
    return response.data;
  }
  const response = await api.get(`/activity/${urlEncodedProjectName}`, {
    params: {
      username,
    },
  });
  return response.data;
}
