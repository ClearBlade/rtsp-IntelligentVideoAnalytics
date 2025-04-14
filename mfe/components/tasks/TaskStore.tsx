import { Task, TaskComponentProps } from "../Tasks";
import LineCrossing from "./LineCrossing";
import ObjectDetection from "./ObjectDetection";
import ScheduledRecording from "./ScheduledRecording";
import ScheduledSnapshot from "./ScheduledSnapshot";
import React from "react";

export interface TaskStore {
  id: string;
  name: string;
  description: string;
  ai_task: boolean;
  device_outputs: { id: string; label: string }[];
  component: (props: TaskComponentProps) => JSX.Element;
}

export const TASK_STORE: TaskStore[] = [
  {
    id: "line_crossing",
    name: "Line crossing",
    description: "Detects objects that crosses a virtual line",
    ai_task: true,
    device_outputs: [
      {
        id: "direction",
        label: "Direction",
      },
      {
        id: "crossing",
        label: "Object crossed",
      },
      {
        id: "classification",
        label: "Object classification",
      },
      {
        id: "frame",
        label: "Frame",
      },
      {
        id: "saved_path",
        label: "Save image/video path",
      },
    ],
    component: (props) => <LineCrossing {...props} />,
  },
  {
    id: "object_detection",
    name: "Object detection",
    description: "Identifies specific objects",
    ai_task: true,
    device_outputs: [
      {
        id: "total_objects_detected",
        label: "Total objects detected",
      },
      {
        id: "objects_detected",
        label: "Objects detected",
      },
      {
        id: "frame",
        label: "Frame",
      },
      {
        id: "saved_path",
        label: "Save image/video path",
      },
    ],
    component: (props) => <ObjectDetection {...props} />,
  },
  {
    id: "scheduled_recording",
    name: "Scheduled recording",
    description: "Record continuously or on a schedule",
    ai_task: false,
    device_outputs: [
      {
        id: "saved_path",
        label: "Saved video path",
      },
    ],
    component: (props) => <ScheduledRecording {...props} />,
  },
  {
    id: "scheduled_snapshot",
    name: "Scheduled snapshot",
    description: "Capture still images on a schedule",
    ai_task: false,
    device_outputs: [
      {
        id: "saved_path",
        label: "Saved image path",
      },
    ],
    component: (props) => <ScheduledSnapshot {...props} />,
  },
];
