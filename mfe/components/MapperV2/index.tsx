import {
  Box,
  Theme,
  makeStyles,
  Typography,
  Button,
  MenuItem,
  MenuList,
  Popover,
  Tooltip,
} from "@material-ui/core";
import React, { useState } from "react";
import IAMapper from "./IAMapper";
import TextWithIcon from "../../helpers/TextWithIcon";
import AddIcon from "@material-ui/icons/Add";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  popper: {
    zIndex: 188,
    overflow: "hidden",
    width: "100%",
  },
}));

export interface Mappings {
  device_output: { id: string; label: string };
  target_asset: { id: string; label: string };
  target_attribute: { id: string; label: string };
}

export const Mapper = ({
  mappings,
  assets,
  onMappingsChange,
}: {
  mappings: Mappings[];
  assets: any[];
  onMappingsChange: (mappings: Mappings[]) => void;
}) => {
  const TARGETS = [
    {
      ID: "Intelligent Assets",
      Content: (
        <IAMapper
          mappings={mappings}
          assets={assets}
          onMappingsChange={onMappingsChange}
        />
      ),
      disabled: false,
    },
    {
      ID: "Google Pub/Sub",
      Content: <></>,
      disabled: true,
    },
    {
      ID: "IoT Core",
      Content: <></>,
      disabled: true,
    },
  ];

  const classes = useStyles();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const anchorRef = React.useRef(null);
  const menuRef = React.useRef(null);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        className={classes.root}
      >
        <Box>
          <Typography
            variant="body1"
            style={{ fontWeight: "bold" }}
            gutterBottom
          >
            Data destinations
          </Typography>
        </Box>
        <Box>
          <Button
            ref={anchorRef}
            variant="text"
            color="secondary"
            size="small"
            onClick={() => {
              setMenuOpen(true);
            }}
          >
            <AddIcon fontSize="small" />
          </Button>
        </Box>
        <Popover
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          onClose={() => setMenuOpen(false)}
          className={classes.popper}
          open={menuOpen}
          anchorEl={anchorRef.current}
        >
          <Box width="100%">
            <MenuList ref={menuRef}>
              {TARGETS.map((opt, i) => (
                <MenuItem
                  key={i}
                  onClick={() => {
                    setSelectedTarget(opt.ID);
                    setMenuOpen(false);
                  }}
                  disabled={opt.disabled}
                  button
                >
                  <Box>
                    <Typography variant="body1">{opt.ID}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </MenuList>
          </Box>
        </Popover>
      </Box>
      {(selectedTarget || mappings.length > 0) &&
        TARGETS.find((t) => t.ID === selectedTarget)?.Content}
    </>
  );
};
