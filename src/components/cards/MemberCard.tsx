import { AccountCircle, Add } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SxProps,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useGetMembersOfProjectQuery } from "~/hooks/fetching/project/query";
import AddMemberDialog from "../dialogs/AddMemberDialog";
export default function MemberCard({ sx }: { sx?: SxProps }) {
  const [open, setOpen] = useState(false);
  const { currentProject } = useParams();
  const memberListQuery = useGetMembersOfProjectQuery(currentProject);
  const memberList = memberListQuery.data?.data ?? [];
  return (
    <Card sx={sx}>
      <CardHeader title="Members" />
      <CardContent>
        <List>
          {memberList.map((member) => (
            <ListItem>
              <ListItemAvatar>
                <AccountCircle />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Link
                    component={RouterLink}
                    to={`memberInfo/${member._id}`}
                    underline="hover"
                  >
                    {`${member.account.username} (${member.name})`}
                  </Link>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions>
        <Button startIcon={<Add />} onClick={() => setOpen(true)}>
          Add a member
        </Button>
      </CardActions>
      <AddMemberDialog open={open} setOpen={setOpen} />
    </Card>
  );
}
