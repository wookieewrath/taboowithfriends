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
import "firebase/firestore";
import firebase from "firebase/app";
import Confetti from "react-dom-confetti";

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
const confettiConfig = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 130,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "300px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
};

function PlayerView({ match, location }) {
  const classes = useStyles();
  const [lobbyID, setLobbyID] = useState(sessionStorage.getItem("lobbyID"));
  const [gameID, setGameID] = useState(sessionStorage.getItem("gameID"));
  const [isTeamsLoading, setIsTeamsLoading] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const playerID = parseInt(sessionStorage.getItem("playerID"), 10);
  const [isKicked, setIsKicked] = useState(false);
  const history = useHistory();
  const [gameSettings, setGameSettings] = useState();
  const [teamSettings, setTeamSettings] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutID = useRef(1);
  const [teamsArray, setTeamsArray] = useState();
  const [joinDisabled, setJoinDisabled] = useState(false);
  const [canKicked, setCanKicked] = useState(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    async function initDB() {
      const lobbyRef = await db.collection("Lobbies").doc(lobbyID);
      const lobbyRefObj = await lobbyRef.get();

      const teamsCollection = await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams");

      if (teamsCollection && lobbyRefObj.exists) {
        return teamsCollection.onSnapshot((querySnapshot) => {
          const teams = querySnapshot.docs.map((doc) => doc.data());
          setTeamsArray(teams);
          setIsTeamsLoading(false);
        });
      }
    }
    return initDB();
  }, []);

  useEffect(() => {
    async function initGameSettings() {
      const lobbyRef = await db
        .collection("Lobbies")
        .doc(lobbyID)
        .onSnapshot((doc) => {
          setIsGameLoading(false);
          setGameSettings(doc.data().gameSettings);
        });
      return lobbyRef;
    }
    return initGameSettings();
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

  function getPlayerObject() {
    const playerObject = teamsArray
      .find((team) => team.players.find((player) => player.id === playerID))
      .players.find((player) => player.id === playerID);

    return playerObject;
  }

  function getCurrentTeamID() {
    const currentTeamID = teamsArray.find((team) =>
      team.players.find((player) => player.id === playerID)
    ).id;

    return currentTeamID;
  }

  async function joinTeam(newTeamID) {
    setJoinDisabled(true);
    const playerObject = getPlayerObject();
    const currentTeamID = getCurrentTeamID();

    if (newTeamID !== currentTeamID) {
      let currentTeamRef = await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams")
        .doc(currentTeamID);
      let newTeamRef = await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams")
        .doc(newTeamID);

      await Promise.all([
        currentTeamRef.update({
          players: firebase.firestore.FieldValue.arrayRemove(playerObject),
        }),
        newTeamRef.update({
          players: firebase.firestore.FieldValue.arrayUnion(playerObject),
        }),
      ]);
    }
    setJoinDisabled(false);
  }

  async function handleKickStatus() {
    const teamObject = teamsArray.find((team) =>
      team.players.find((player) => player.id === playerID)
    );

    // This if/else captures the "canKicked" for the next run of this function -- Not the current run!
    if (teamObject && teamObject.id === "Float") {
      setCanKicked(true);
    } else if (teamObject) {
      setCanKicked(false);
    }

    // The canKicked that is checked in this IF statement checks the 'previous' value of canKicked
    // -- NOT the canKicked that is set above!
    if (!teamObject && canKicked) {
      setIsKicked(true);
    }
  }

  useEffect(() => {
    if (!isUndefined(teamsArray) && !isNull(teamsArray) && !joinDisabled) {
      clearInterval(timeoutID.current);
      timeoutID.current = setTimeout(() => handleKickStatus(), 300);
    }
  }, [teamsArray, joinDisabled]);

  if (isTeamsLoading || isGameLoading || teamsArray.isUndefined) {
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
        <div style={{ marginBottom: "25px" }}>{lobbyID}</div>
        <div className={classes.root}>
          <h6 style={{ margin: "25px" }}>
            Game Mode:{" "}
            <span style={{ fontWeight: "normal" }}>
              {gameSettings.gameMode === "turn"
                ? `Turn Limit of ${gameSettings.turnLimit} turns`
                : `Score Limit of ${gameSettings.scoreLimit} points`}
            </span>
          </h6>
          <h6 style={{ margin: "25px" }}>
            Seconds Per Round:{" "}
            <span style={{ fontWeight: "normal" }}>
              {" "}
              {gameSettings.secondsPerRound}{" "}
            </span>
          </h6>
          <h6 style={{ margin: "25px" }}>
            Buzz Penalty:{" "}
            <span style={{ fontWeight: "normal" }}>
              {" "}
              {gameSettings.buzzPenalty}{" "}
            </span>
          </h6>
          <h6 style={{ margin: "25px" }}>
            Skip Penalty:{" "}
            <span style={{ fontWeight: "normal" }}>
              {" "}
              {gameSettings.skipPenalty}{" "}
            </span>
          </h6>
          <h6 style={{ margin: "25px" }}>
            Correct Reward:{" "}
            <span style={{ fontWeight: "normal" }}>
              {" "}
              {gameSettings.correctReward}{" "}
            </span>
          </h6>
        </div>

        <TeamsContainer
          teamsArray={teamsArray.filter(
            (team) => team.teamName === "Waiting Room"
          )}
          playerView={true}
          joinTeam={joinTeam}
          joinDisabled={joinDisabled}
        />
        <div />
        <TeamsContainer
          teamsArray={teamsArray.filter(
            (team) => team.teamName !== "Waiting Room"
          )}
          playerView={true}
          joinTeam={joinTeam}
          joinDisabled={joinDisabled}
        />

        <br />
      </MuiThemeProvider>
    );
}

export default PlayerView;
