import Chip from "@material-ui/core/Chip";
import SentimentVerySatisfiedIcon from "@material-ui/icons/SentimentVerySatisfied";
import StarIcon from '@material-ui/icons/Star';
import React from "react";

function PlayerChip({ isHost, name, deletePlayer, id, playerView, playerID }) {
  return (
    <Chip
      label={name}
      //id={IDBFactory}
      onDelete={(isHost || playerView) ? null : () => {deletePlayer(id)}}
      style={{ margin: 4 }}
      color="primary"
      icon={isHost ? <StarIcon/> : <SentimentVerySatisfiedIcon />}
    />
  );
}

export default PlayerChip;
