
import { Box, Typography, Grid, Toolbar, Container } from "@mui/material";
import { useParams } from "react-router-dom";
import ActiveTaskCount from "~/components/cards/ActiveTaskCountCard";
import ArtifactDetails from "~/components/cards/ArtifactDetailsCard";
import CompletedTaskCount from "~/components/cards/CompletedTaskCountCard";
import PhaseDetails from "~/components/cards/PhaseDetailsCard";
import PhaseProgress from "~/components/cards/PhaseProgressCard";
import ScannerDetails from "~/components/cards/ScannerDetailsCard";
import { usePhaseQuery } from "~/hooks/fetching/phase/query";
import { Task } from "~/hooks/fetching/task";

/**
 * Hàm tính toán phần trăm tiến độ hoàn thành của phase
 * @param tasks - Danh sách các task trong phase
 * @returns Phần trăm hoàn thành (0-100)
 */
function getPhaseProgress(tasks: Task[]) {
  const total = tasks.length;
  if (total === 0) return 0;
  const completed = tasks.filter((task) => task.status === "completed").length;
  return (completed / total) * 100;
}

/**
 * Component hiển thị chi tiết của một phase
 * Bao gồm thông tin tổng quan, danh sách task, artifacts và scanner details
 */
export default function PhaseDetail() {
  // Lấy phaseId từ URL params
  const { phaseId } = useParams();
  if (!phaseId) {
    return <></>;
  }
  
  // Query để lấy thông tin chi tiết của phase
  const getPhaseQuery = usePhaseQuery(phaseId);
  const phase = getPhaseQuery.data?.data;
  if (!phase) return <></>;
  
  // Tính toán số lượng task theo trạng thái
  const activeTaskCount = phase.tasks.filter(
    (task) => task.status === "active"
  ).length;
  const completedTaskCount = phase.tasks.filter(
    (task) => task.status === "completed"
  ).length;
  return (
    <Box 
      sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Vùng cuộn chứa nội dung chính */}
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <Container sx={{ my: 4, pb: 4 }} maxWidth="xl">
          <Grid container spacing={2}>
            {/* Header hiển thị tên và mô tả phase */}
            <Grid item xs={12}>
              <Typography variant="h4">{phase.name}</Typography>
              <Typography variant="subtitle1">{phase.description}</Typography>
            </Grid>
            
            {/* Card hiển thị số task đang hoạt động */}
            <Grid item xs={12} sm={6} md={3}>
              <ActiveTaskCount count={activeTaskCount} />
            </Grid>
            
            {/* Card hiển thị số task đã hoàn thành */}
            <Grid item xs={12} sm={6} md={3}>
              <CompletedTaskCount count={completedTaskCount} />
            </Grid>
            
            {/* Card hiển thị tiến độ phase */}
            <Grid item md={6}>
              <PhaseProgress
                sx={{ height: "100%" }}
                value={getPhaseProgress(phase.tasks)}
              />
            </Grid>
            
            {/* Card hiển thị thông tin scanner */}
            <Grid item xs={12}>
              <ScannerDetails phase={phase} />
            </Grid>
            
            {/* Card hiển thị chi tiết artifacts */}
            <Grid item xs={12}>
              <ArtifactDetails phase={phase} />
            </Grid>
            
            {/* Card hiển thị danh sách task và quản lý */}
            <Grid item xs={12}>
              <PhaseDetails phase={phase} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
