import { makeStyles, Theme } from '@material-ui/core';
import { MultiStepModalActionsHeight } from './constants';

const sharedMultiStepModalStyles = (theme: Theme) => ({
  dialogTitle: {
    padding: `${theme.spacing(1)}px ${theme.spacing(3)}px`,
  },
  fullWidthDivider: {
    marginRight: -theme.spacing(3),
    marginLeft: -theme.spacing(3),
  },
  actionsBar: {
    height: MultiStepModalActionsHeight, // Setting height explicitly here so that it can be used elsewhere to set margins etc
    backgroundColor: theme.palette.background.paper,
    zIndex: 189,
  },
});

export const useMultiStepModalStylesMobile = makeStyles((theme) => ({
  ...sharedMultiStepModalStyles(theme),
  dialogContent: {
    overflowX: 'hidden',
  },
  noPadding: {
    padding: 0,
  },
}));

const sharedTabsDrawerStyles = (theme: Theme) => ({
  avatar: {
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  activeAvatar: {
    backgroundColor: theme.palette.primary.main,
  },
});

export const useMobileTabsDrawerStyles = makeStyles((theme) => ({
  ...sharedTabsDrawerStyles(theme),
  select: {
    borderRadius: 0,
    boxShadow: `0 5px 2px -2px ${theme.palette.divider}`,
  },
  popover: {
    left: '0px !important', // override the automatic setting shifting the popover to the right
  },
  fullWidth: {
    marginRight: -theme.spacing(3),
    marginLeft: -theme.spacing(3),
  },
  arrowDownIcon: {
    marginRight: theme.spacing(3.8), // Make it align with the close icon
  },
}));
