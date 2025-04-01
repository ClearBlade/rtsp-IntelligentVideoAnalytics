import { Avatar, Box, MenuItem, Select, Typography } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { MultiStepModalStep } from "./types";
import { useMobileTabsDrawerStyles } from "./utils/styles";
import TextWithIcon from "../../helpers/TextWithIcon";

export const MobileTabsDrawer = ({
  steps,
  activeStepIdx,
  onStepClick,
  disableNextSteps,
}: {
  steps: MultiStepModalStep[];
  activeStepIdx: number;
  onStepClick: (stepId: number) => void;
  disableNextSteps?: boolean;
}) => {
  const classes = useMobileTabsDrawerStyles();

  const ErrorIcon = (msg?: string) =>
    msg ? <ErrorOutlineIcon color="error" /> : null;

  const TitleComponent = ({
    idx,
    tab,
  }: {
    idx: number;
    tab?: MultiStepModalStep;
  }) => {
    if (!tab) return <></>;
    return (
      <Box display="flex" justifyContent="space-between" width="100%">
        <Typography>{tab.Title}</Typography>
        {/* <TextWithIcon
          text={<Typography>{tab.Title}</Typography>}
          icon={(className) => (
            <Avatar
              className={clsx(className, classes.avatar, {
                [classes.activeAvatar]: idx === activeStepIdx,
              })}
            >
              <Typography>{idx + 1}</Typography>
            </Avatar>
          )}
          iconMargin={2}
        /> */}
        {ErrorIcon(tab.errorMessage)}
      </Box>
    );
  };

  return (
    <div className={classes.fullWidth}>
      <Select
        fullWidth
        className={classes.select}
        classes={{ icon: classes.arrowDownIcon }}
        renderValue={(val) => {
          if (typeof val === "number") {
            return TitleComponent({
              idx: activeStepIdx,
              tab: steps[val],
            });
          }
          return <></>;
        }}
        value={activeStepIdx}
        onChange={(e) => {
          if (typeof e.target.value === "number") {
            onStepClick(e.target.value);
          }
        }}
        variant="outlined"
        MenuProps={{
          PopoverClasses: { paper: classes.popover },
        }}
      >
        {steps.map((tab, idx) => (
          <MenuItem
            key={idx}
            value={idx}
            disabled={disableNextSteps && idx > activeStepIdx}
          >
            {TitleComponent({ idx, tab })}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};
