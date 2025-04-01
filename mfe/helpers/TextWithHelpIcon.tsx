import {
  Box,
  Typography,
  Tooltip,
  IconButton,
  makeStyles,
  Theme,
  ClickAwayListener,
} from "@material-ui/core";
import React, { useState } from "react";
import HelpIcon from "@material-ui/icons/Help";

const useStyles = makeStyles((theme: Theme) => ({
  typographyText: {
    fontWeight: "bold",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
}));

const useStylesTooltip = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.white,
  },
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontSize: 11,
    boxShadow: theme.shadows[5],
  },
}));

function TextWithHelpIcon({
  label,
  helpText,
  openOnClick = false,
}: {
  label: string;
  helpText: string | NonNullable<React.ReactNode>;
  openOnClick?: boolean;
}) {
  const classes = useStyles();
  const classesTooltip = useStylesTooltip();

  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  return (
    <Box display={"flex"} alignItems="flex-start">
      <Typography variant="body2" className={classes.typographyText}>
        {label}
      </Typography>
      <ClickAwayListener onClickAway={handleTooltipClose}>
        <Tooltip
          PopperProps={{
            disablePortal: openOnClick ? true : undefined,
          }}
          classes={classesTooltip}
          title={helpText}
          placement="right"
          onClose={openOnClick ? handleTooltipClose : undefined}
          open={openOnClick ? open : undefined}
          disableFocusListener={openOnClick ? true : undefined}
          disableHoverListener={openOnClick ? true : undefined}
          disableTouchListener={openOnClick ? true : undefined}
          interactive
          arrow
        >
          <IconButton
            size="small"
            aria-label="help"
            style={{ marginLeft: 4 }}
            onClick={openOnClick ? handleTooltipOpen : undefined}
          >
            <HelpIcon fontSize="small" style={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
      </ClickAwayListener>

      {/* {keepOpen ? (
        <Tooltip
          classes={classesTooltip}
          title={helpText}
          placement="right"
          arrow
        >
          <IconButton size="small" aria-label="help" style={{ marginLeft: 4 }}>
            <HelpIcon fontSize="small" style={{ fontSize: "16px" }} />
          </IconButton>
        </Tooltip>
      ) : (
        <ClickAwayListener onClickAway={handleTooltipClose}>
          <div>
            <Tooltip
              PopperProps={{
                disablePortal: true,
              }}
              onClose={handleTooltipClose}
              open={open}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title={helpText}
            >
              <IconButton
                size="small"
                aria-label="help"
                style={{ marginLeft: 4 }}
              >
                <HelpIcon fontSize="small" style={{ fontSize: "16px" }} />
              </IconButton>
            </Tooltip>
          </div>
        </ClickAwayListener>
      )} */}
    </Box>
  );
}

export default TextWithHelpIcon;
