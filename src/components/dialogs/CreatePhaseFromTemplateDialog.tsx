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
      sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: 2 }}
    >
      <Typography variant="body1" gutterBottom>
        Choose how you want to create phases for your project:
      </Typography>
      <Button 
        variant="contained" 
        sx={{ mt: 2, minWidth: 240 }} 
        onClick={selectTemplate}
      >
        Use an existing template
      </Button>
      <Button 
        variant="contained" 
        sx={{ mt: 2, minWidth: 240 }} 
        onClick={createNew}
      >
        Create new phases
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
          label="Save this as a private template for future use"
        />
        <TextField
          label="Set name"
          variant="outlined"
          fullWidth
          {...register("name", { required: "Name is required" })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="Set description"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          {...register("description", { required: "Description is required" })}
          error={!!errors.name}
          helperText={errors.description?.message}
        />
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, alignSelf: "flex-start" }}>
          Phases to create:
        </Typography>
        {fields.map((field, index) => (
          <Card sx={{ m: 1, width: '100%' }} key={field.id}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Phase {index + 1}
              </Typography>
              <TextField
                label="Phase name"
                fullWidth
                {...register(`phases.${index}.name` as const, {
                  required: "Name is required",
                })}
                error={!!errors.phases?.[index]?.name}
                helperText={errors.phases?.[index]?.name?.message}
                sx={{ mb: 1 }}
              />
              <TextField
                label="Phase description"
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
          Add another phase
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
      {data?.isPrivate && (
        <FormControlLabel
          control={<Checkbox checked={data?.isPrivate} />}
          label="This will be saved as a private template for future use"
          disabled
        />
      )}
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        disabled
        defaultValue={data?.name}
      />
      <TextField
        label="Description"
        variant="outlined"
        multiline
        rows={4}
        fullWidth
        disabled
        defaultValue={data?.description}
      />
      
      <Typography variant="h6" sx={{ mt: 2, alignSelf: "flex-start" }}>
        The following phases will be created:
      </Typography>
      
      {data?.phases.map((field, index) => (
        <Card sx={{ m: 1, width: '100%' }} key={index}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Phase {index + 1}
            </Typography>
            <TextField
              label="Phase name"
              fullWidth
              sx={{ mb: 1 }}
              disabled
              defaultValue={field.name}
            />
            <TextField
              label="Phase description"
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
            ? "Create phases for your project"
            : activeStep === 1
            ? "Fill in the information"
            : "Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This wizard will help you create phases for your project. You can either select from existing templates or create a new set of phases.
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
            <Button onClick={createPhasesFromTemplate}>Create Phases</Button>
          )}
        </DialogActions>
      </Dialog>
    </PhaseTemplateContext.Provider>
  );
}
