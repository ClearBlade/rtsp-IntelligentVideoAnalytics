import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Theme,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { Task, TaskCardContent } from "./Tasks";
import { Delete } from "@material-ui/icons";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import EditIcon from "@material-ui/icons/Edit";
import TextWithIcon from "../helpers/TextWithIcon";
import AddIcon from "@material-ui/icons/Add";
import { TASK_STORE } from "./tasks/TaskStore";
import { v4 as uuid } from "uuid";

const columns = [
  {
    id: "name",
    label: "Task name",
    minWidth: 170,
    align: "right",
  },
  {
    id: "type",
    label: "Task type",
    minWidth: 170,
    align: "right",
  },
  {
    id: "actions",
    label: "Actions",
    minWidth: 170,
    align: "right",
  },
];

interface TaskTableProps {
  deviceId: string;
  edgeId: string;
  tasks: Task[];
  image: { base64: string; timestamp: number } | null;
  handleTaskChange: (task: Task) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[] | null>>;
  handleDeleteTask: (uuid: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },
  typographyText: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  AIChip: {
    marginLeft: theme.spacing(1),
    height: theme.spacing(1),
    fontWeight: "bold",
    "&.MuiChip-root": {
      fontSize: "0.6rem",
    },
  },
}));

export default function TaskTable({
  deviceId,
  edgeId,
  tasks,
  image,
  setTasks,
  handleTaskChange,
  handleDeleteTask,
}: TaskTableProps) {
  const classes = useStyles();

  console.log("tasks: ", tasks);

  const [task, setTask] = useState<Task | null>(null);
  const [openTaskCard, setOpenTaskCard] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);

  const getTaskTypeDetails = (type: string) => {
    const task = TASK_STORE.find((task) => task.id === type);
    if (!task) return { name: "Unknown task type", ai_task: false };
    return task;
  };

  // const handleChange = (event, rowIndex, column, assetId) => {
  //   const asset = assets.find(
  //     (asset) => asset.id === (assetId || event.target.value)
  //   );
  //   if (!asset) return;

  //   const newRows = [...mappings];

  //   newRows[rowIndex][column] = {
  //     id: event.target.value,
  //     label:
  //       column === "target_asset"
  //         ? asset?.label ?? ""
  //         : asset.attributes.find(
  //             (attribute) => attribute.id === event.target.value
  //           )?.label ?? "",
  //   };

  //   onMappingsChange(newRows);
  // };

  return (
    <Box className="rajasClass">
      <Box display="flex" style={{ gap: 8 }}>
        <Typography
          className={classes.typographyText}
          variant="h5"
          align="left"
          color="textSecondary"
          gutterBottom
        >
          Tasks
        </Typography>
        <Box
          width={"100%"}
          display={"flex"}
          style={{ gap: 8 }}
          justifyContent="flex-end"
        >
          <Box>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => {
                setTask({
                  uuid: uuid(),
                  name: "",
                  id: "",
                  settings: {},
                  isOpen: true,
                  mappings: [],
                });
                setOpenTaskCard(true);
              }}
            >
              <TextWithIcon
                text={"Add"}
                icon={(className) => (
                  <AddIcon fontSize="small" className={className} />
                )}
              />
            </Button>
          </Box>
        </Box>
      </Box>
      <Paper className={classes.root}>
        <TableContainer className={classes.container}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((row, rowIndex) => (
                <TableRow hover key={rowIndex}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Box display={"flex"} alignItems="center">
                      <Typography variant="body2">
                        {getTaskTypeDetails(row.id).name}
                      </Typography>
                      {getTaskTypeDetails(row.id).ai_task && (
                        <Chip
                          className={classes.AIChip}
                          style={{ height: "16px" }}
                          size="small"
                          label={"AI"}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit task" arrow>
                      <IconButton
                        onClick={() => {
                          setTask(row);
                          setIsEditing(true);
                          setOpenTaskCard(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duplicate task" arrow>
                      <IconButton
                        onClick={() => {
                          setTask({
                            ...row,
                            name: `${row.name} (Copy)`,
                            uuid: uuid(),
                          });
                          setOpenTaskCard(true);
                        }}
                      >
                        <FileCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete task" arrow>
                      <IconButton
                        onClick={() => {
                          setTask(row);
                          setShowDeleteConfirmation(true);
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openTaskCard}
        onClose={() => {
          setOpenTaskCard(false);
          setIsEditing(false);
        }}
      >
        {!isEditing ? (
          <DialogTitle>New task</DialogTitle>
        ) : (
          <DialogTitle>Edit task</DialogTitle>
        )}
        <DialogContent>
          {task && (
            <TaskCardContent
              deviceId={deviceId}
              edgeId={edgeId}
              task={task}
              onTaskChange={setTask}
              image={image}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => setOpenTaskCard(false)}
            color="primary"
            variant="text"
          >
            Cancel
          </Button>
          <Button
            size="small"
            onClick={() => {
              if (!task) return;
              if (isEditing) {
                handleTaskChange(task);
              } else {
                setTasks((prev) => {
                  if (!prev) return null;
                  return [...prev, task];
                });
              }
              setOpenTaskCard(false);
              setIsEditing(false);
            }}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
      >
        {/* <DialogTitle>Delete task</DialogTitle> */}
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setShowDeleteConfirmation(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              if (!task) return;
              handleDeleteTask(task.uuid);
              setShowDeleteConfirmation(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
