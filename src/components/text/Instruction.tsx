import { Typography } from "@mui/material";

export default function Instruction() {
  return (
    <>
      <Typography variant="h6">Script writing instruction</Typography>
      <Typography color="error">
        - Do not use comments in your script since they can not be parsed
      </Typography>
      <Typography>
        - The function exposes a <b>name</b> variable which holds the name of an
        image. For example: redis, aquasec/trivy, etc.
      </Typography>
      <Typography>
        - The <b>cmd</b> variable holds the command to run the tool in a Linux
        terminal
      </Typography>
      <Typography>
        - In the <b>try-catch</b> block, you will write the code to transform
        variable <b>json</b> into the <b>response</b> array with each object
        follows the interface of <b>Vulnerability</b>
      </Typography>
      <Typography>
        - After that, the result will be sent to the server to add
        vulnerabilities to the artifact that has the exact name as the{" "}
        <b>name</b> variable
      </Typography>
    </>
  );
}
