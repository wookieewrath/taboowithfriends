import Button from "@material-ui/core/Button";
import {
  createMuiTheme,
  makeStyles,
  MuiThemeProvider,
} from "@material-ui/core/styles";
import { isEqual, isNull, isUndefined, set } from "lodash";
import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { db } from "../constants";
import TeamsContainer from "./TeamsContainer";
import { Redirect } from "react-router-dom";

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
  const [lobbyID, setLobbyID] = useState(sessionStorage.getItem("lobbyID"));
  const [gameID, setGameID] = useState(sessionStorage.getItem("gameID"));
  const [isLoading, setIsLoading] = useState(true);
  const playerID = parseInt(sessionStorage.getItem("playerID"), 10);
  const [isKicked, setIsKicked] = useState(false);
  const history = useHistory();
  const [gameSettings, setGameSettings] = useState();
  const [teamSettings, setTeamSettings] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutID = useRef(1);
  useEffect(() => {
    const initDB = db
      .collection("Lobbies")
      .doc(lobbyID)
      .onSnapshot((doc) => {
        setGameSettings(doc.data().gameSettings);
        setTeamSettings(doc.data().teamSettings);
        setIsLoading(false);
      });
    return initDB;
  }, []);

  useEffect(() => {
    const playingSnapshot = db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .onSnapshot((doc) => {
        setIsPlaying(doc.data().playing);
      });
    return playingSnapshot;
  }, []);

  function deleteTeam(teamToDelete) {
    if (teamSettings.teams.length > 2) {
      const newTeam = {
        ...teamSettings,
        teams: teamSettings.teams.filter((x) => x.teamName !== teamToDelete),
      };
      db.collection("Lobbies")
        .doc(lobbyID)
        .set({ teamSettings: newTeam }, { merge: true });
      setTeamSettings(newTeam);
      return newTeam;
    }
  }

  function deletePlayer(playerToDelete) {
    setTeamSettings((prevState) => {
      const newTeam = {
        ...prevState,
        teams: prevState.teams.map((team) => ({
          teamName: team.teamName,
          players: team.players.filter(
            (player) => player.id !== playerToDelete
          ),
        })),
      };
      db.collection("Lobbies")
        .doc(lobbyID)
        .set({ teamSettings: newTeam }, { merge: true });
      return newTeam;
    });
  }

  async function joinTeam(newTeamID) {
    const lobbyRef = await db.collection("Lobbies").doc(lobbyID);
    const doc = await lobbyRef.get();
    const oldTeams = doc.data().teamSettings.teams;
    let curPlayer;

    let curPlayerTeamIndex = oldTeams.findIndex(
      (team) =>
        team.players.filter((player) => player.id === playerID).length > 0
    );
    let newPlayerTeamIndex = oldTeams.findIndex(
      (team) => team.id === newTeamID
    );
    //console.log("current", curPlayerTeamIndex);
    //console.log("new", newPlayerTeamIndex);

    db.collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .update({
        wordsUsed: firebase.firestore.FieldValue.arrayUnion(randomInt),
      });

    const newTeams = oldTeams
      .map((team) => {
        const newPlayers = team.players.filter((player) => {
          if (player.id === playerID) {
            curPlayer = player;
          }
          return player.id !== playerID;
        });
        team.players = newPlayers;
        return team;
      })
      .map((team) => {
        if (team.id === newTeamID) {
          team.players.push(curPlayer);
          return team;
        }
        return team;
      });

    await lobbyRef.update({ teamSettings: { teams: newTeams } });
  }

  async function inTeam(playerID) {
    const lobbyRef = await db.collection("Lobbies").doc(lobbyID);
    const doc = await lobbyRef.get();
    const teams = doc.data().teamSettings.teams;

    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams[i].players.length; j++) {
        if (isEqual(teams[i].players[j].id, playerID)) {
          return teams[i].id;
        }
      }
    }
    setIsKicked(true);
    return false;
  }

  useEffect(() => {
    if (
      !isUndefined(gameSettings) &&
      !isUndefined(teamSettings) &&
      !isNull(gameSettings) &&
      !isNull(teamSettings)
    ) {
      inTeam(playerID);
    }
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
  } else if (isPlaying === "game") {
    sessionStorage.setItem("playerID", playerID);
    sessionStorage.setItem("lobbyID", lobbyID);
    sessionStorage.setItem("gameID", gameID);
    return (
      <Redirect
        to={{
          pathname: `/game`,
        }}
      />
    );
  } else
    return (
      <MuiThemeProvider theme={theme}>
        <p></p>
        <div>You are currently in Room:</div>
        <div>{lobbyID}</div>
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
        />
        <br />
      </MuiThemeProvider>
    );
}

export default PlayerView;
