import {
  makeStyles,
  TextField,
  TextFieldProps,
  Theme,
  Typography,
} from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    fontWeight: "bold",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
}));

function CustomTextField(props: TextFieldProps & { label: string }) {
  const classes = useStyles();
  const { label, ...rest } = props;
  return (
    <>
      <Typography variant="body2" align="left" className={classes.label}>
        {label}{" "}
      </Typography>
      <TextField label={""} {...rest} />
    </>
  );
}

export default CustomTextField;
