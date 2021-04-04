import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import React from "react";
import PlayerChip from "./PlayerChip";

function TeamCard({
  teamList,
  teamName,
  teamID,
  deleteTeam,
  deletePlayer,
  playerView,
  joinTeam
}) {
  return (
    <Card style={{ maxWidth: "100vw", minHeight: 50, padding: 15, margin: 5 }}>
      <Typography>{teamName}</Typography>

      {teamList.map((player) => {
        return (
          <PlayerChip
            name={player.name}
            isHost={player.isHost}
            deletePlayer={deletePlayer}
            id={player.id}
            playerView={playerView}
          ></PlayerChip>
        );
      })}
      <CardActions style={{ justifyContent: "center" }}>
        {playerView ? (
          <Button size="small" color="primary" onClick={()=>{joinTeam(teamID)}}>
            Join Team
          </Button>
        ) : teamList.length === 0 ? (
          <Button
            size="small"
            color="secondary"
            onClick={() => {
              deleteTeam(teamID);
            }}
          >
            Delete Team
          </Button>
        ) : (
          ""
        )}
      </CardActions>
    </Card>
  );
}

export default TeamCard;
