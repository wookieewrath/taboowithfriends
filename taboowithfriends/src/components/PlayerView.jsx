import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/core/Slider";
import {
  createMuiTheme,
  makeStyles,
  MuiThemeProvider,
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState } from "react";
import TeamsContainer from "./TeamsContainer";
import { db } from "../constants";
import { isEqual } from "lodash";
import { Link, useHistory, Redirect } from "react-router-dom";

// Styling that apparently can't be inline :( !
const useStyles = makeStyles({
  root: {
    width: 350,
  },
  input: {
    width: 45,
  },
});
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#ffac12",
    },
  },
});

function PlayerView({ match, location }) {
  const classes = useStyles();
  const [gameID, setGameID] = useState(match.params.roomID);
  const [isLoading, setIsLoading] = useState(true);
  const playerName = location.state.playerName;
  const playerID = parseInt(match.params.playerID, 10);
  const [isKicked, setIsKicked] = useState(false);
  const history = useHistory();
  const [gameSettings, setGameSettings] = useState({
    gameSettings: {
      gameMode: "loading...",
      turnLimit: "loading...",
      scoreLimit: "loading...",
      secondsPerRound: "loading...",
      buzzPenalty: "loading...",
      skipPenalty: "loading...",
      correctReward: "loading...",
    },
  });
  const [teamSettings, setTeamSettings] = useState({
    teams: [
      {
        teamName: "",
        id: "",
        players: [{ name: "", id: "", isHost: false }],
      },
    ],
  });

  useEffect(() => {
    const initDB = db
      .collection("Games")
      .doc(gameID)
      .onSnapshot((doc) => {
        setGameSettings(doc.data().gameSettings);
        setTeamSettings(doc.data().teamSettings);
        setIsLoading(false);
      });
    return initDB;
  }, []);

  function deleteTeam(teamToDelete) {
    setTeamSettings((prevState) => {
      if (prevState.teams.length > 2) {
        const newTeam = {
          ...prevState,
          teams: prevState.teams.filter((x) => x.teamName !== teamToDelete),
        };
        db.collection("Games")
          .doc(gameID)
          .set({ teamSettings: newTeam }, { merge: true });
        return newTeam;
      } else {
        console.log("There must be at least two teams!");
        return {
          ...prevState,
        };
      }
    });
  }

  function deletePlayer(playerToDelete) {
    setTeamSettings((prevState) => {
      const newTeam = {
        ...prevState,
        teams: prevState.teams.map((x) => ({
          teamName: x.teamName,
          players: x.players.filter((y) => y.id !== playerToDelete),
        })),
      };
      db.collection("Games")
        .doc(gameID)
        .set({ teamSettings: newTeam }, { merge: true });
      return newTeam;
    });
  }

  async function joinTeam(newTeamID) {
    const gameRef = await db.collection("Games").doc(gameID);
    const doc = await gameRef.get();
    const oldTeams = doc.data().teamSettings.teams;
    var playerToSwitch = {};
    var teams = {};

    for (var i = 0; i < oldTeams.length; i++) {
      for (var j = 0; j < oldTeams[i].players.length; j++) {
        if (isEqual(oldTeams[i].players[j].id, playerID)) {
          playerToSwitch = oldTeams[i].players[j];
          oldTeams[i].players.splice(j, 1);
          break;
        }
      }
    }
    for (var i = 0; i < oldTeams.length; i++) {
      if (oldTeams[i].id === newTeamID) {
        oldTeams[i].players.push(playerToSwitch);
        teams = oldTeams;
      }
    }
    await gameRef.update({ teamSettings: { teams } });
  }

  async function inTeam(playerID) {
    const gameRef = await db.collection("Games").doc(gameID);
    const doc = await gameRef.get();
    const teams = doc.data().teamSettings.teams;

    for (var i = 0; i < teams.length; i++) {
      for (var j = 0; j < teams[i].players.length; j++) {
        if (isEqual(teams[i].players[j].id, playerID)) {
          return true;
        }
      }
    }
    setIsKicked(true);
    return false;
  }

  useEffect(() => {
    inTeam(playerID);
  }, [gameSettings, teamSettings]);

  if (isLoading) {
    return (
      <div>
        <h1>Loading</h1>
      </div>
    );
  } else if (isKicked) {
    return (
      <div>
        <h1>You have been kicked :'(</h1>
        <Button
          variant="contained"
          color="primary"
          size="large"
          style={{ margin: 15, backgroundColor: "#ffac12" }}
          onClick={() => {
            history.push(`/`);
          }}
        >
          SULK AND GO HOME
        </Button>
      </div>
    );
  } else
    return (
      <MuiThemeProvider theme={theme}>
        <p></p>
        <div>You are currently in Room:</div>
        <div>{gameID}</div>
        <div className={classes.root}>
          <h6>
            Game Mode:{" "}
            <span style={{ fontWeight: "normal" }}>
              {gameSettings.gameMode === "turn"
                ? `Turn Limit of ${gameSettings.turnLimit} turns`
                : `Score Limit of ${gameSettings.scoreLimit} points`}
            </span>
          </h6>
          <h6>
            Seconds Per Round:{" "}
            <span style={{ fontWeight: "normal" }}>
              {" "}
              {gameSettings.secondsPerRound}{" "}
            </span>
          </h6>
          <h6>
            Buzz Penalty:{" "}
            <span style={{ fontWeight: "normal" }}>
              {" "}
              {gameSettings.buzzPenalty}{" "}
            </span>
          </h6>
          <h6>
            Skip Penalty:{" "}
            <span style={{ fontWeight: "normal" }}>
              {" "}
              {gameSettings.skipPenalty}{" "}
            </span>
          </h6>
          <h6>
            Correct Reward:{" "}
            <span style={{ fontWeight: "normal" }}>
              {" "}
              {gameSettings.correctReward}{" "}
            </span>
          </h6>
        </div>

        <TeamsContainer
          dataForTeamsContainer={teamSettings}
          deleteTeam={deleteTeam}
          deletePlayer={deletePlayer}
          playerView={true}
          joinTeam={joinTeam}
        ></TeamsContainer>
        <p></p>
      </MuiThemeProvider>
    );
}

export default PlayerView;
