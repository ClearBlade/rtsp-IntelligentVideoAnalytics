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
import { fetchAssets } from "@clearblade/ia-mfe-core"; // TODO - Can use custom hook here for fetching assets but doesn't give the schema
import { useQuery } from "react-query";
import CircularProgress from "@material-ui/core/CircularProgress";

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
  // rootPath: { id: string; path: string } | undefined;
  mappings: Mappings[];
  assets: { id: string; label: string; attributes: Record<string, any>[] }[];
  onMappingsChange: (mappings: Mappings[]) => void;
  // onRootPathChange: (path: { id: string; path: string }) => void;
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

export default function Mapper({
  mappings,
  assets,
  onMappingsChange,
}: MapperProps) {
  const classes = useStyles();
  // const [rows, setRows] = React.useState<Mappings[]>([]);

  // const {
  //   data: assetsIA,
  //   isLoading: isLoadingAssets,
  //   isError: isErrorAssets,
  // } = useQuery({
  //   queryKey: ["assets"],
  //   queryFn: () => fetchAssetTypeTree(new AbortController(), {}),
  // });

  const handleChange = (event, rowIndex, column, assetId) => {
    const asset = assets.find(
      (asset) => asset.id === (assetId || event.target.value)
    );
    // if (!asset) return;

    const newRows = [...mappings];

    newRows[rowIndex][column] = {
      id: event.target.value,
      label:
        column === "target_asset"
          ? asset?.label ?? ""
          : asset?.attributes.find(
              (attribute) => attribute.id === event.target.value
            )?.label ?? "",
    };

    onMappingsChange(newRows);
  };

  // useEffect(() => {
  //   setRows(
  //     mappings.map((map) => ({
  //       device_output: map.device_output ?? { id: "", label: "" },
  //       target_asset: map.target_asset ?? { id: "", label: "" },
  //       target_attribute: map.target_attribute ?? { id: "", label: "" },
  //     }))
  //   );
  // }, [mappings]);

  // useEffect(() => {
  //   onMappingsChange(rows);
  // }, [rows]);

  // if (isLoadingAssets) {
  //   return <CircularProgress size={20} />;
  // }

  // if (isErrorAssets) {
  //   return (
  //     <Typography variant="body2" color="textSecondary">
  //       Error loading assets
  //     </Typography>
  //   );
  // }

  // console.log(assetsIA);

  return (
    <>
      <Box className={classes.cardTitle}>
        <Typography variant="body1" style={{ fontWeight: "bold" }} gutterBottom>
          Data destinations
        </Typography>
      </Box>
      {/* <Box>
        <ConfigureBucketSet
          rootPath={rootPath}
          onRootPathChange={onRootPathChange}
        />
      </Box> */}
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
                        // console.log(e);
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
                          const selectedAsset = assets.find(
                            (asset) => asset.id === value
                          );
                          return selectedAsset ? (
                            <>
                              <Typography variant="body2">
                                {selectedAsset.label}
                              </Typography>
                              {/* <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {selectedAsset?.id}
                              </Typography> */}
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
                      {assets.map((asset) => (
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
                          const selectedAsset = assets.find(
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
                              {/* <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {selectedAsset?.id}
                              </Typography> */}
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
                      {assets
                        .find((asset) => asset.id === row.target_asset.id)
                        ?.attributes.map((attribute) => (
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
