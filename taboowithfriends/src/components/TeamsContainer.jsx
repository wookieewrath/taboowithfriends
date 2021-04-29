import { Grid } from "@material-ui/core";
import React from "react";
import TeamCard from "./TeamCard";

function TeamsContainer({ dataForTeamsContainer, deleteTeam, deletePlayer, playerView, joinTeam }) {
  return (
    <div>
      <Grid container spacing={1} justify="center" alignItems="center">
        {dataForTeamsContainer.teams.map((team) => {
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
              ></TeamCard>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

export default TeamsContainer;
