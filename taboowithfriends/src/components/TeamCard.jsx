import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import React, { useEffect, useRef, useState } from "react";
import PlayerChip from "./PlayerChip";
import {
  createMuiTheme,
  makeStyles,
  MuiThemeProvider,
} from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#ffac12",
    },
  },
});

function TeamCard({
  teamList,
  teamName,
  teamID,
  deleteTeam,
  deletePlayer,
  playerView,
  joinTeam,
}) {
  const [isDisabled, setIsDisabled] = useState(false);
  const timeoutID = useRef(1);
  useEffect(() => {
    if (isDisabled === true) {
      timeoutID.current = setTimeout(setIsDisabled(false), 500);
    }
  }, [isDisabled]);
  return (
    <MuiThemeProvider theme={theme}>
      <Card
        style={{ maxWidth: "100vw", minHeight: 50, padding: 15, margin: 5 }}
      >
        <Typography>{teamName}</Typography>

        {teamList.map((player) => {
          return (
            <PlayerChip
              name={player.name}
              isHost={player.isHost}
              deletePlayer={deletePlayer}
              id={player.id}
              playerView={playerView}
              key={player.id}
            />
          );
        })}
        <CardActions style={{ justifyContent: "center" }}>
          {playerView ? (
            <Button
              size="small"
              color="primary"
              onClick={() => {
                joinTeam(teamID);
              }}
            >
              Join Team
            </Button>
          ) : teamList.length === 0 ? (
            <Button
              size="small"
              color="secondary"
              onClick={() => {
                deleteTeam(teamID);
                setIsDisabled(true);
              }}
              isDisabled={isDisabled}
            >
              Delete Team
            </Button>
          ) : (
            ""
          )}
        </CardActions>
      </Card>
    </MuiThemeProvider>
  );
}

export default TeamCard;
