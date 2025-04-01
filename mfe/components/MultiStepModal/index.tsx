import React from "react";
import { MobileMultiStepModal } from "./MobileMultiStepModal";
import { MultiStepModalProps } from "./types";

export const MultiStepModal = ({
  steps,
  activeStepIdx,
  ...rest
}: MultiStepModalProps) => {
  const activeStep = steps[activeStepIdx];

  if (!activeStep || !rest.open) return null;

  return (
    <MobileMultiStepModal
      {...rest}
      activeStep={activeStep}
      activeStepIdx={activeStepIdx}
      steps={steps}
    />
  );
};
