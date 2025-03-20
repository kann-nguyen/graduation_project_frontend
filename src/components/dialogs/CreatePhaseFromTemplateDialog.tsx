import { ArrowForward } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Stack,
  Step,
  StepButton,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { PhaseTemplate } from "~/hooks/fetching/phase";
import {
  useCreatePhasesFromTemplateMutation,
  usePhaseTemplatesQuery,
} from "~/hooks/fetching/phase/query";

interface TabPanelProps {
  templateList: PhaseTemplate[];
  value: number;
  index: number;
  selectTemplate: (template: PhaseTemplate) => void;
}
interface ContextType {
  data: PhaseTemplate | undefined;
  setData: Dispatch<SetStateAction<PhaseTemplate | undefined>>;
}
const PhaseTemplateContext = createContext<ContextType>({
  data: undefined,
  setData: () => {},
});

function TabPanel(props: TabPanelProps) {
  const { templateList, value, index, selectTemplate } = props;
  if (value !== index) return <></>;
  return (
    <Box>
      {templateList.map((temp) => {
        return (
          <Card sx={{ m: 1 }} key={temp.name}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {temp.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {temp.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => selectTemplate(temp)}>
                Select
              </Button>
            </CardActions>
          </Card>
        );
      })}
    </Box>
  );
}

interface SelectTemplateProps {
  setSelection: Dispatch<SetStateAction<"template" | "create">>;
  updateStep: () => void;
}
interface CreatePhaseTemplateProps {
  updateStep: () => void;
}
function SelectTemplateOrCreate({
  updateStep,
  setSelection,
}: SelectTemplateProps) {
  function selectTemplate() {
    updateStep();
    setSelection("template");
  }
  function createNew() {
    updateStep();
    setSelection("create");
  }
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Button variant="contained" sx={{ mt: 2 }} onClick={selectTemplate}>
        Select a template
      </Button>
      <Button variant="contained" sx={{ mt: 2 }} onClick={createNew}>
        Create a new one
      </Button>
    </Box>
  );
}

function SelectTemplate({ updateStep }: CreatePhaseTemplateProps) {
  const { setData } = useContext(PhaseTemplateContext);
  const [value, setValue] = useState(0);
  const templatesQuery = usePhaseTemplatesQuery();
  const templates = templatesQuery.data?.data ?? [];
  const publicTemplates = templates.filter((x) => x.isPrivate === false);
  const privateTemplates = templates.filter((x) => x.isPrivate === true);
  function selectTemplate(template: PhaseTemplate) {
    updateStep();
    setData(template);
  }
  function handleChangeTab(event: React.SyntheticEvent, newValue: number) {
    setValue(newValue);
  }
  return (
    <>
      <Box sx={{ display: "flex" }}>
        <Tabs value={value} onChange={handleChangeTab}>
          <Tab label="Public templates" />
          <Tab label="Private templates" />
        </Tabs>
      </Box>
      <TabPanel
        index={0}
        templateList={publicTemplates}
        value={value}
        selectTemplate={selectTemplate}
      />
      <TabPanel
        index={1}
        templateList={privateTemplates}
        value={value}
        selectTemplate={selectTemplate}
      />
    </>
  );
}
function CreateNew({ updateStep }: CreatePhaseTemplateProps) {
  const { setData, data } = useContext(PhaseTemplateContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<PhaseTemplate>({
    defaultValues: data ?? {
      name: "",
      description: "",
      isPrivate: false,
      phases: [
        {
          name: "",
          description: "",
          order: 0,
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "phases",
  });
  async function onSubmit(data: PhaseTemplate) {
    updateStep();
    setData(data);
  }
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={1} alignItems="center">
        <FormControlLabel
          control={
            <Controller
              name="isPrivate"
              control={control}
              defaultValue={false}
              render={({ field }) => <Checkbox {...field} />}
            />
          }
          label="Make this template private"
        />
        <TextField
          label="Template's name"
          variant="outlined"
          fullWidth
          {...register("name", { required: "Name is required" })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="Template's description"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          {...register("description", { required: "Description is required" })}
          error={!!errors.name}
          helperText={errors.description?.message}
        />
        {fields.map((field, index) => (
          <Card sx={{ m: 1 }} key={field.id}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Phase {index + 1}
              </Typography>
              <TextField
                label="Name"
                fullWidth
                {...register(`phases.${index}.name` as const, {
                  required: "Name is required",
                })}
                error={!!errors.phases?.[index]?.name}
                helperText={errors.phases?.[index]?.name?.message}
                sx={{ mb: 1 }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                {...register(`phases.${index}.description` as const, {
                  required: "Description is required",
                })}
                error={!!errors.phases?.[index]?.description}
                helperText={errors.phases?.[index]?.description?.message}
              />
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => remove(index)}>
                Remove
              </Button>
            </CardActions>
          </Card>
        ))}
        <Button
          variant="contained"
          sx={{ m: 1, p: 1 }}
          onClick={() =>
            append({ name: "", description: "", order: fields.length })
          }
          fullWidth
        >
          Add phase
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ m: 1, p: 1 }}
          color="success"
          endIcon={<ArrowForward />}
          type="submit"
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}

function ConfirmPhaseTemplate() {
  const { data } = useContext(PhaseTemplateContext);
  return (
    <Stack spacing={1} alignItems="center" sx={{ m: 2 }}>
      <FormControlLabel
        control={<Checkbox defaultChecked={data?.isPrivate} />}
        label="Private template"
        disabled
      />
      <TextField
        label="Template's name"
        variant="outlined"
        fullWidth
        disabled
        defaultValue={data?.name}
      />
      <TextField
        label="Template's description"
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        disabled
        defaultValue={data?.description}
      />
      {data?.phases.map((field, index) => (
        <Card sx={{ m: 1 }} key={index}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Phase {index + 1}
            </Typography>
            <TextField
              label="Name"
              fullWidth
              sx={{ mb: 1 }}
              disabled
              defaultValue={field.name}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              disabled
              defaultValue={field.description}
            />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
interface CreatePhaseTemplateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export default function CreatePhaseFromTemplateDialog({
  setOpen,
  open,
}: CreatePhaseTemplateFormProps) {
  const { currentProject } = useParams();
  const createPhasesFromTemplateMutation =
    useCreatePhasesFromTemplateMutation();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Step 1", "Step 2", "Step 3"];
  const [selection, setSelection] = useState<"template" | "create">("template");
  const [data, setData] = useState<PhaseTemplate>();
  function increaseStep() {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }
  function handleStepChange(step: number) {
    return () => {
      setActiveStep(step);
    };
  }
  function conditionalRender() {
    switch (activeStep) {
      case 0:
        return (
          <SelectTemplateOrCreate
            updateStep={increaseStep}
            setSelection={setSelection}
          />
        );
      case 1:
        if (selection === "template") {
          return <SelectTemplate updateStep={increaseStep} />;
        }
        return <CreateNew updateStep={increaseStep} />;
      case 2:
        if (data !== undefined) return <ConfirmPhaseTemplate />;
        return <></>;
    }
  }
  function createPhasesFromTemplate() {
    if (data && currentProject) {
      createPhasesFromTemplateMutation.mutate({
        projectName: currentProject,
        data,
      });
      setOpen(false);
    }
  }
  return (
    <PhaseTemplateContext.Provider value={{ data, setData }}>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {activeStep === 0
            ? "Create a new phase template"
            : activeStep === 1
            ? "Fill in the information"
            : "Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This wizard will help you create a new phase template. Tip: You can
            always click on the steps to go back.
          </DialogContentText>
          <Box>{conditionalRender()}</Box>
          <Stepper activeStep={activeStep} sx={{ m: 4 }} nonLinear>
            {steps.map((label, index) => {
              return (
                <Step key={label}>
                  <StepButton onClick={handleStepChange(index)}>
                    {label}
                  </StepButton>
                </Step>
              );
            })}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {activeStep === 2 && (
            <Button onClick={createPhasesFromTemplate}>Create</Button>
          )}
        </DialogActions>
      </Dialog>
    </PhaseTemplateContext.Provider>
  );
}
