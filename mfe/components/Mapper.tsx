import React from "react";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Box, MenuItem, TextField, Typography } from "@material-ui/core";
import TextWithHelpIcon from "../helpers/TextWithHelpIcon";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useFetchAssetsWithAttrs } from "../api/useFetchAssetsWithAttrs";

const columns = [
  {
    id: "device_output",
    label: "Device output",
    minWidth: 170,
    align: "right",
  },
  {
    id: "target_asset",
    label: "Target asset",
    minWidth: 170,
    align: "right",
  },
  {
    id: "target_attribute",
    label: "Target attribute",
    minWidth: 170,
    align: "right",
  },
];

export interface Mappings {
  device_output: { id: string; label: string };
  target_asset: { id: string; label: string };
  target_attribute: { id: string; label: string };
}

interface MapperProps {
  mappings: Mappings[];
  onMappingsChange: (mappings: Mappings[]) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },
  cardTitle: {
    marginBottom: theme.spacing(2),
  },
}));

export default function Mapper({ mappings, onMappingsChange }: MapperProps) {
  const classes = useStyles();

  const { data: assets, isLoading, isError } = useFetchAssetsWithAttrs();

  const handleChange = (event, rowIndex, column, assetId) => {
    const newMappings = [...mappings];
    const newValue = event.target.value;

    if (column === "target_asset") {
      const selectedAsset = assets.DATA.find((asset) => asset.id === newValue);
      newMappings[rowIndex] = {
        ...newMappings[rowIndex],
        target_asset: {
          id: newValue,
          label: selectedAsset?.label || "",
        },
        target_attribute: { id: "", label: "" },
      };
    } else if (column === "target_attribute") {
      const currentAssetId = newMappings[rowIndex].target_asset.id;
      if (!currentAssetId || !newValue) {
        newMappings[rowIndex] = {
          ...newMappings[rowIndex],
          target_attribute: { id: "", label: "" },
        };
      } else {
        const selectedAsset = assets.DATA.find(
          (asset) => asset.id === currentAssetId
        );
        const selectedAttribute = selectedAsset?.attributes.find(
          (attribute) => attribute.id === newValue
        );

        if (selectedAttribute) {
          newMappings[rowIndex] = {
            ...newMappings[rowIndex],
            target_attribute: {
              id: newValue,
              label: selectedAttribute.label,
            },
          };
        } else {
          newMappings[rowIndex] = {
            ...newMappings[rowIndex],
            target_attribute: { id: "", label: "" },
          };
        }
      }
    }

    onMappingsChange(newMappings);
  };

  if (isLoading) {
    return <CircularProgress size={20} />;
  }

  if (isError) {
    return (
      <Typography variant="body2" color="textSecondary">
        Error loading assets
      </Typography>
    );
  }

  return (
    <>
      <Box className={classes.cardTitle}>
        <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
          Data destinations
        </Typography>
      </Box>
      <TextWithHelpIcon
        label="Data output mappings"
        helpText="Map the device's outputs to an assets' custom attributes. Assets must be created first to enable mapping. To receive alerts about asset status changes, set up rule types and rules to monitor target attributes."
      />
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
              {mappings.map((row, rowIndex) => (
                <TableRow hover key={rowIndex}>
                  <TableCell>{row.device_output.label}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      fullWidth
                      variant="standard"
                      size="small"
                      value={row.target_asset.id || ""}
                      name="target_asset"
                      onChange={(e) => {
                        handleChange(e, rowIndex, "target_asset", "");
                      }}
                      InputProps={{
                        disableUnderline: true, // This removes the underline
                      }}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (value) => {
                          if (!value) {
                            return (
                              <Typography variant="body2" color="textSecondary">
                                Select asset
                              </Typography>
                            );
                          }
                          const selectedAsset = assets.DATA.find(
                            (asset) => asset.id === value
                          );
                          return selectedAsset ? (
                            <>
                              <Typography variant="body2">
                                {selectedAsset.label}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Select asset
                            </Typography>
                          );
                        },
                      }}
                    >
                      <MenuItem value={""}>
                        <Typography variant="body2">
                          {"Select asset"}
                        </Typography>
                      </MenuItem>
                      {assets.DATA.map((asset) => (
                        <MenuItem key={asset.id} value={asset.id}>
                          <Box>
                            <Typography variant="body2">
                              {asset.label}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {asset.id}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      fullWidth
                      variant="standard"
                      size="small"
                      value={row.target_attribute.id}
                      name="target_attribute"
                      onChange={(e) =>
                        handleChange(
                          e,
                          rowIndex,
                          "target_attribute",
                          row.target_asset.id
                        )
                      }
                      InputProps={{
                        disableUnderline: true, // This removes the underline
                      }}
                      SelectProps={{
                        displayEmpty: true,
                        renderValue: (value) => {
                          if (!value) {
                            return (
                              <Typography variant="body2" color="textSecondary">
                                Select attribute
                              </Typography>
                            );
                          }
                          const selectedAsset = assets.DATA.find(
                            (asset) => asset.id === row.target_asset.id
                          );
                          const selectedAttribute =
                            selectedAsset?.attributes.find(
                              (attribute) => attribute.id === value
                            );
                          return selectedAttribute ? (
                            <>
                              <Typography variant="body2">
                                {selectedAttribute.label}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              Select attribute
                            </Typography>
                          );
                        },
                      }}
                    >
                      <MenuItem value="">
                        <Typography variant="body2">
                          {"Select attribute"}
                        </Typography>
                      </MenuItem>
                      {assets.DATA.find(
                        (asset) => asset.id === row.target_asset.id
                      )?.attributes.map((attribute) => (
                        <MenuItem key={attribute.id} value={attribute.id}>
                          <Typography variant="body2">
                            {attribute.label}
                          </Typography>
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
