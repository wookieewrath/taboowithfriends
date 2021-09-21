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
import React, { useEffect, useState, useRef } from "react";
import TeamsContainer from "./TeamsContainer";
import { db } from "../constants";
import { generateID } from "../id";
import { isEqual } from "lodash";
import { randomAnimal } from "../animal";
import { Redirect } from "react-router-dom";
import "firebase/firestore";
import firebase from "firebase/app";

// Styling that apparently can't be inline :( !
const useStyles = makeStyles({
  root: {
    width: 300,
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

function HostView({ match, location }) {
  const classes = useStyles();
  const [lobbyID, setLobbyID] = useState(sessionStorage.getItem("lobbyID"));
  const [gameID, setGameID] = useState(sessionStorage.getItem("gameID"));
  const [hostID, setHostID] = useState(sessionStorage.getItem("playerID"));
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameSettings, setGameSettings] = useState({});
  const [teamSettings, setTeamSettings] = useState({});
  const [oldTeamSettings, setOldTeamSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const timeoutID = useRef(1);
  const [wordPackLength, setWordPackLength] = useState(0);
  const [teamsCollection, setTeamsCollection] = useState();
  const [teamsArray, setTeamsArray] = useState();

  useEffect(() => {
    async function initDB() {
      const lobbyRef = await db.collection("Lobbies").doc(lobbyID);
      const lobbyRefObj = await lobbyRef.get();

      const teamsCollection = await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams");

      // As of now, we just hope this if-check is valid :grimacing:
      if (teamsCollection && lobbyRefObj.exists) {
        setGameSettings(lobbyRefObj.data().gameSettings);
        return teamsCollection.onSnapshot((querySnapshot) => {
          const teams = querySnapshot.docs.map((doc) => doc.data());
          setTeamsArray(teams);
          setIsLoading(false);
        });
      } else {
        console.log("foo");
      }
    }
    return initDB();
  }, []);

  useEffect(() => {
    db.collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .onSnapshot((doc) => {
        setIsPlaying(doc.data().playing);
      });
  }, []);

  useEffect(() => {
    if (gameSettings && Object.keys(gameSettings).length !== 0) {
      clearInterval(timeoutID.current); // read up on dis
      timeoutID.current = setTimeout(
        () =>
          db
            .collection("Lobbies")
            .doc(lobbyID)
            .set({ gameSettings }, { merge: true }),
        1000
      );
    }
  }, [gameSettings]);

  useEffect(() => {
    if (
      teamSettings &&
      Object.keys(teamSettings).length !== 0 &&
      !isEqual(oldTeamSettings, teamSettings)
    ) {
      db.collection("Lobbies")
        .doc(lobbyID)
        .set({ teamSettings }, { merge: true });
    }
  }, [teamSettings]);

  async function deleteTeam(teamToDelete) {
    if (teamsArray.length > 3) {
      await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams")
        .doc(teamToDelete)
        .delete()
        .then(console.log("Deleted!"));
    } else {
      console.log("There must be at least two teams!");
    }
  }

  //TODO: Error handling
  function getPlayerObject(playerToDeleteID) {
    const playerObject = teamsArray
      .find((team) =>
        team.players.find((player) => player.id === playerToDeleteID)
      )
      .players.find((player) => player.id === playerToDeleteID);

    return playerObject;
  }
  //TODO: Error handling
  function getPlayerTeamID(playerForWhomWeAreGettingTheID) {
    const currentTeamID = teamsArray.find((team) =>
      team.players.find(
        (player) => player.id === playerForWhomWeAreGettingTheID
      )
    ).id;

    return currentTeamID;
  }

  async function deletePlayer(playerToDelete) {
    const objectOfPlayerToDelete = getPlayerObject(playerToDelete);
    const currentTeamIDThatPlayerIsOn = getPlayerTeamID(playerToDelete);

    if (currentTeamIDThatPlayerIsOn === "Float") {
      let currentTeamRef = await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams")
        .doc(currentTeamIDThatPlayerIsOn);
      await currentTeamRef.update({
        players: firebase.firestore.FieldValue.arrayRemove(
          objectOfPlayerToDelete
        ),
      });
    } else {
      let currentTeamRef = await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams")
        .doc(currentTeamIDThatPlayerIsOn);
      let newTeamRef = await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams")
        .doc("Float");

      await Promise.all([
        currentTeamRef.update({
          players: firebase.firestore.FieldValue.arrayRemove(
            objectOfPlayerToDelete
          ),
        }),
        newTeamRef.update({
          players: firebase.firestore.FieldValue.arrayUnion(
            objectOfPlayerToDelete
          ),
        }),
      ]);
    }
  }

  async function addTeam() {
    if (teamsArray.length < 10) {
      let teamsRefID;
      await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams")
        .add({ players: [], teamName: randomAnimal() })
        .then((doc) => {
          teamsRefID = doc.id;
        });
      await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Teams")
        .doc(teamsRefID)
        .set({ id: teamsRefID }, { merge: true });
    } else {
      console.log("Too many teams!");
    }
  }

  function checkTeamsValid() {
    return (
      teamsArray.length > 1 &&
      !teamsArray.filter(
        (team) => team.players.length < 2 && team.id !== "Float"
      ).length
    );
  }

  async function startGame() {
    const gameRef = await db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID);
    const teamsForGame = teamsArray
      .filter((team) => team.id !== "Float")
      .map((team) => ({
        ...team,
        describerIndex: 0,
        score: 0,
      }));
    const wordsRef = await db.collection("Words").doc("WordPack");
    const wordsDoc = await wordsRef.get();
    const words = await wordsDoc.data();
    let randomInt = Math.floor(Math.random() * words.length); //TODO: Fix this hardcoded value....
    let randomWord = words.wordsArray[randomInt];
    await gameRef.set(
      {
        ...gameSettings,
        teams: teamsForGame,
        activeTeam: 0,
        inRound: false,
        roundNumber: 1,
        wordsUsed: [],
        currentWord: {
          _id: randomWord._id,
          badwords: randomWord.badwords,
          title: randomWord.title,
        },
        gameOver: false,
        roundEndTime: -1,
      },
      { merge: true }
    );
    await db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .update({
        playing: "game",
      });
  }

  if (isLoading) {
    return <h1>Loading...</h1>;
  } else if (isPlaying === "game") {
    sessionStorage.setItem("playerID", hostID);
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
        <div>Your Room ID:</div>
        <div>{lobbyID}</div>
        <p></p>
        <div className={classes.root}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Game Mode</FormLabel>
            <RadioGroup
              aria-label="Game Mode"
              name="Game Mode"
              value={gameSettings.gameMode}
              onChange={(e, newVal) => {
                if (gameSettings.gameMode !== newVal) {
                  setGameSettings({
                    ...gameSettings,
                    gameMode: e.target.value,
                  });
                }
              }}
            >
              <FormControlLabel
                value="turn"
                control={<Radio />}
                label="Turn Limit"
              />
              <FormControlLabel
                value="score"
                control={<Radio />}
                label="Score Limit"
              />
            </RadioGroup>
          </FormControl>

          <p></p>
          <Typography>Turn Limit</Typography>
          <Slider
            value={gameSettings.turnLimit}
            step={1}
            marks
            min={1}
            max={10}
            valueLabelDisplay="auto"
            onChange={(e, newVal) => {
              if (gameSettings.turnLimit !== newVal) {
                setGameSettings({ ...gameSettings, turnLimit: newVal });
              }
            }}
            disabled={gameSettings.gameMode === "score"}
          />

          <p></p>
          <Typography>Score Limit</Typography>
          <Slider
            value={gameSettings.scoreLimit}
            step={1}
            marks
            min={10}
            max={30}
            valueLabelDisplay="auto"
            onChange={(e, newVal) => {
              if (gameSettings.scoreLimit !== newVal) {
                setGameSettings({ ...gameSettings, scoreLimit: newVal });
              }
            }}
            disabled={gameSettings.gameMode === "turn"}
          />

          <p></p>
          <Typography>Seconds Per Round</Typography>
          <Slider
            value={gameSettings.secondsPerRound}
            step={10}
            marks
            min={20}
            max={120}
            valueLabelDisplay="auto"
            onChange={(e, newVal) => {
              if (gameSettings.secondsPerRound !== newVal) {
                setGameSettings({ ...gameSettings, secondsPerRound: newVal });
              }
            }}
          />

          <p></p>
          <Typography>Buzz Penalty</Typography>
          <Slider
            value={gameSettings.buzzPenalty}
            step={1}
            marks
            min={-4}
            max={0}
            valueLabelDisplay="auto"
            onChange={(e, newVal) => {
              if (gameSettings.buzzPenalty !== newVal) {
                setGameSettings({ ...gameSettings, buzzPenalty: newVal });
              }
            }}
          />

          <p></p>
          <Typography>Skip Penalty</Typography>
          <Slider
            value={gameSettings.skipPenalty}
            step={1}
            marks
            min={-4}
            max={0}
            valueLabelDisplay="auto"
            onChange={(e, newVal) => {
              if (gameSettings.skipPenalty !== newVal) {
                setGameSettings({ ...gameSettings, skipPenalty: newVal });
              }
            }}
          />

          <p></p>
          <Typography>Correct Reward</Typography>
          <Slider
            value={gameSettings.correctReward}
            step={1}
            marks
            min={1}
            max={4}
            valueLabelDisplay="auto"
            onChange={(e, newVal) => {
              if (gameSettings.correctReward !== newVal) {
                setGameSettings({ ...gameSettings, correctReward: newVal });
              }
            }}
          />
        </div>

        <Button
          style={{
            width: 120,
            height: 50,
            backgroundColor: "#ffac12",
            fontWeight: "bold",
            margin: 15,
          }}
          onClick={addTeam}
        >
          Add Team
        </Button>

        <TeamsContainer
          teamsArray={teamsArray.filter(
            (team) => team.teamName === "Waiting Room"
          )}
          deleteTeam={deleteTeam}
          deletePlayer={deletePlayer}
        />
        <div />
        <TeamsContainer
          teamsArray={teamsArray.filter(
            (team) => team.teamName !== "Waiting Room"
          )}
          deleteTeam={deleteTeam}
          deletePlayer={deletePlayer}
        />

        <Button
          style={{
            width: 200,
            height: 70,
            backgroundColor: "#fa8100",
            fontWeight: "bold",
            margin: 15,
          }}
          disabled={!checkTeamsValid()}
          onClick={startGame}
        >
          Start Game!
        </Button>
        <br />
      </MuiThemeProvider>
    );
}

export default HostView;
