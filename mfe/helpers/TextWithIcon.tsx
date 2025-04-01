import { Box, BoxProps, makeStyles, Theme } from "@material-ui/core";
import React from "react";

const useTextWithIconStyles = makeStyles<
  Theme,
  { iconMargin?: number; iconMarginLeft?: number }
>((theme) => ({
  iconStyles: ({ iconMargin, iconMarginLeft }) => ({
    marginRight: theme.spacing(iconMargin ?? 1),
    marginLeft: theme.spacing(iconMarginLeft ?? 0),
  }),
}));

export default function TextWithIcon({
  text,
  icon,
  iconMargin,
  iconMarginLeft,
  ...boxProps
}: {
  text: string | JSX.Element;
  icon?: (className?: string) => JSX.Element;
  iconMargin?: number;
  iconMarginLeft?: number;
} & BoxProps) {
  const { iconStyles } = useTextWithIconStyles({
    iconMargin,
    iconMarginLeft,
  });
  return (
    <Box display="flex" alignItems="center" {...boxProps}>
      {icon && icon(iconStyles)}
      {text}
    </Box>
  );
}
