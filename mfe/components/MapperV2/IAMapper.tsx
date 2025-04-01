import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Typography,
  Box,
  Theme,
  makeStyles,
} from "@material-ui/core";
import React from "react";
import { Mappings } from "../Mapper";

interface IAMapperProps {
  mappings: Mappings[];
  assets: { id: string; label: string; attributes: Record<string, any>[] }[];
  onMappingsChange: (mappings: Mappings[]) => void;
}

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

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },
}));

function IAMapper({
  mappings,
  assets,
  onMappingsChange,
}: IAMapperProps & {
  mappings: Mappings[];
}) {
  const classes = useStyles();

  const handleChange = (event, rowIndex, column, assetId) => {
    const asset = assets.find(
      (asset) => asset.id === (assetId || event.target.value)
    );
    if (!asset) return;

    const newRows = [...mappings];

    newRows[rowIndex][column] = {
      id: event.target.value,
      label:
        column === "target_asset"
          ? asset?.label ?? ""
          : asset.attributes.find(
              (attribute) => attribute.id === event.target.value
            )?.label ?? "",
    };

    onMappingsChange(newRows);
  };

  return (
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
                    value={row.target_asset.id}
                    name="target_asset"
                    onChange={(e) => {
                      // console.log(e);
                      handleChange(e, rowIndex, "target_asset", "");
                    }}
                    InputProps={{
                      disableUnderline: true, // This removes the underline
                    }}
                  >
                    <MenuItem value="">
                      <Typography variant="body2">{"Select asset"}</Typography>
                    </MenuItem>
                    {assets.map((asset) => (
                      <MenuItem key={asset.id} value={asset.id}>
                        <Box>
                          <Typography variant="body2">{asset.label}</Typography>
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
  );
}

export default IAMapper;
