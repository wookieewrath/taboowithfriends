import Chip from "@material-ui/core/Chip";
import SentimentVerySatisfiedIcon from "@material-ui/icons/SentimentVerySatisfied";
import React from "react";

function PlayerChip({ isHost, name, deletePlayer }) {
  return (
    <Chip
      label={name}
      onDelete={
        isHost
          ? null
          : () => {
              deletePlayer(name);
            }
      }
      style={{ margin: 4 }}
      color="primary"
      icon={<SentimentVerySatisfiedIcon />}
    ></Chip>
  );
}

export default PlayerChip;
