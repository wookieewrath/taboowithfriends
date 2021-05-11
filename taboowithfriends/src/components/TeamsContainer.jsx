import { Grid } from "@material-ui/core";
import React from "react";
import TeamCard from "./TeamCard";

function TeamsContainer({
  teamsArray,
  deleteTeam,
  deletePlayer,
  playerView = false,
  joinTeam,
  joinDisabled,
}) {
  return (
    <Grid item>
      <Grid
        container
        spacing={1}
        justify="center"
        alignItems="center"
        direction="row"
      >
        {teamsArray.map((team) => {
          return (
            <Grid item md key={team.id}>
              <TeamCard
                teamName={team.teamName}
                teamList={team.players}
                teamID={team.id}
                deleteTeam={deleteTeam}
                deletePlayer={deletePlayer}
                playerView={playerView}
                joinTeam={joinTeam}
                joinDisabled={joinDisabled}
              ></TeamCard>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
}

export default TeamsContainer;
