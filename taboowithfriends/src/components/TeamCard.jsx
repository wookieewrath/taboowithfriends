import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import React from "react";
import PlayerChip from "./PlayerChip";

function TeamCard({ teamList, teamName, deleteTeam, deletePlayer }) {
  return (
    <Card style={{ maxWidth: "100vw", minHeight: 100, padding: 15, margin: 5 }}>
      <Typography>{teamName}</Typography>

      {teamList.map((player) => {
        return (
          <PlayerChip name={player.name} isHost={player.isHost} deletePlayer={deletePlayer}></PlayerChip>
        );
      })}

      <CardActions style={{ justifyContent: "center" }}>
        <Button size="small" color="secondary" onClick={() => {deleteTeam(teamName)}}>
          Delete Team
        </Button>
      </CardActions>
    </Card>
  );
}

export default TeamCard;
