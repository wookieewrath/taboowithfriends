import { Grid } from "@material-ui/core";
import React from "react";
import TeamCard from "./TeamCard";

function TeamsContainer({dataForTeamsContainer, deleteTeam, deletePlayer}) {
    return (
    <div>
      <Grid container spacing={1} justify="center" alignItems="center">
        {dataForTeamsContainer.someLargeTeamIdentifier.map((team) => {
          return (
            <Grid item md>
              <TeamCard
                teamName={team.teamName}
                teamList={team.players}
                deleteTeam={deleteTeam}
                deletePlayer={deletePlayer}
              ></TeamCard>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

export default TeamsContainer;
