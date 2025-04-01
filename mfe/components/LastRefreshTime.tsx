import { Typography } from "@material-ui/core";
import { formatDistanceToNow } from "date-fns";
import React from "react";

function LastRefreshTime({
  image,
}: {
  image: { base64: string; timestamp: number };
}) {
  if (!image) {
    return null;
  }

  return (
    <Typography variant="caption" color="textSecondary">
      {`Last refreshed: ${formatDistanceToNow(new Date(image.timestamp), {
        addSuffix: true,
      })} (${new Date(image.timestamp).toLocaleString()})`}
    </Typography>
  );
}

export default LastRefreshTime;
