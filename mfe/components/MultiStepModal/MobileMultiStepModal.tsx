import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
} from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import { MobileTabsDrawer } from "./MobileTabsDrawer";
import { MultiStepModalVariationProps } from "./types";
import { useMultiStepModalStylesMobile } from "./utils/styles";

export const MobileMultiStepModal = ({
  open,
  onClose,
  maxWidth,
  steps,
  activeStep,
  activeStepIdx,
  setActiveStepIdx,
  MainTitle,
  disableNextSteps,
  ...dialogProps
}: MultiStepModalVariationProps) => {
  const classes = useMultiStepModalStylesMobile();
  const { Content, Actions } = activeStep;

  return (
    <Dialog
      scroll="paper"
      fullScreen
      disablePortal
      open={open}
      onClose={onClose}
      {...dialogProps}
    >
      <DialogTitle className={classes.dialogTitle}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {MainTitle}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider className={classes.fullWidthDivider} />
        <MobileTabsDrawer
          disableNextSteps={disableNextSteps}
          steps={steps}
          onStepClick={setActiveStepIdx}
          activeStepIdx={activeStepIdx}
        />
      </DialogTitle>

      <DialogContent
        className={clsx(classes.dialogContent, {
          [classes.noPadding]: !!activeStep.config?.noPadding,
        })}
      >
        {Content}
      </DialogContent>

      <Divider />

      <DialogActions className={classes.actionsBar}>{Actions}</DialogActions>
    </Dialog>
  );
};
