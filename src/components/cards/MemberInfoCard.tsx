import { GitHub, PersonRemove } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import RoleChip from "~/components/styled-components/RoleChip";
import { GitLab } from "~/icons/Icons";
import { ThirdParty } from "~/hooks/fetching/account";
import { User } from "~/hooks/fetching/user";
import AvatarImage from "/avatar.webp";
import { useRemoveMemberFromProjectMutation } from "~/hooks/fetching/project/query";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmActionDialog from "../dialogs/ConfirmActionDialog";
import { useState } from "react";
import { useAccountContext } from "~/hooks/general";
function DisplayBadge({ thirdPartyList }: { thirdPartyList: ThirdParty[] }) {
  return (
    <Box justifyContent="center" display="flex" sx={{ py: 1 }}>
      {thirdPartyList.map((t) => {
        if (t.name === "Github") return <GitHub key={t.name} />;
        if (t.name === "Gitlab") return <GitLab key={t.name} />;
      })}
    </Box>
  );
}

export default function MemberInfoCard({ member }: { member: User }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const removeMemberMutation = useRemoveMemberFromProjectMutation();
  const { currentProject } = useParams();
  const accountContext = useAccountContext();
  function removeMember() {
    removeMemberMutation.mutate(
      {
        accountId: member.account._id,
        projectName: currentProject,
      },
      {
        onSuccess: () => {
          navigate(-1);
        },
      }
    );
  }
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Avatar
            src={AvatarImage}
            sx={{
              height: 80,
              mb: 2,
              width: 80,
            }}
          />
          <Typography gutterBottom variant="h5">
            {member.name}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            <RoleChip role={member.account.role} />
          </Typography>
          <DisplayBadge thirdPartyList={member.account.thirdParty} />
        </Box>
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
        {accountContext._id !== member.account._id && (
          <>
            <Button
              color="error"
              startIcon={<PersonRemove />}
              onClick={() => setOpen(true)}
            >
              Remove member
            </Button>
            <ConfirmActionDialog
              open={open}
              setOpen={setOpen}
              text="Do you want to remove this member from the project?"
              callback={removeMember}
            />
          </>
        )}
      </CardActions>
    </Card>
  );
}
