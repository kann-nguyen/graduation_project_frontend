import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  timelineOppositeContentClasses,
} from "@mui/lab";
import { Card, CardContent, CardHeader, SxProps } from "@mui/material";
import { useAdminChangeHistoryQuery } from "~/hooks/fetching/change-history/query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
export default function RecentChangeActivityCard({ sx }: { sx?: SxProps }) {
  const changeHistoryQuery = useAdminChangeHistoryQuery(5);
  const history = changeHistoryQuery.data?.data ?? [];
  return (
    <Card sx={sx}>
      <CardHeader title="Recent activity" />
      <CardContent>
        <Timeline
          sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.5,
            },
          }}
        >
          {history.map((h, index) => (
            <TimelineItem>
              <TimelineOppositeContent color="textSecondary">
                {dayjs().to(dayjs(h.timestamp))}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                {index !== history.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>{h.description}</TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  );
}
