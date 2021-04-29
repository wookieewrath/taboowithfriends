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

  useEffect(() => {
    async function initDB() {
      const lobbyRef = await db.collection("Lobbies").doc(lobbyID);
      const lobbyRefObj = await lobbyRef.get();
      if (lobbyRefObj.exists) {
        setGameSettings(lobbyRefObj.data().gameSettings);
        setTeamSettings(lobbyRefObj.data().teamSettings);
        setOldTeamSettings(lobbyRefObj.data().teamSettings);
        setIsLoading(false);
        return lobbyRef.onSnapshot((doc) => {
          //setOldTeamSettings(teamSettings);
          //setTeamSettings(doc.data().teamSettings);
          setTeamSettings((prevTS) => {
            setOldTeamSettings(prevTS);
            return doc.data().teamSettings;
          });
        });
      } else {
        console.log("lobbyRefObj doesn't exist!");
      }
    }
    return initDB();
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

  useEffect(() => {
    if (gameSettings && Object.keys(gameSettings).length !== 0) {
      clearInterval(timeoutID.current); // read up on dis
      timeoutID.current = setTimeout(
        () =>
          db
            .collection("Lobbies")
            .doc(lobbyID)
            .set({ gameSettings }, { merge: true }),
        2000
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

  function deleteTeam(teamToDelete) {
    if (teamSettings.teams.length > 2) {
      if (!containsHost(teamToDelete)) {
        setTeamSettings({
          ...teamSettings,
          teams: teamSettings.teams.filter((x) => x.id !== teamToDelete),
        });
      } else {
        console.log("The host is on that team!");
      }
    } else {
      console.log("There must be at least two teams!");
    }
  }

  function containsHost(teamID) {
    for (let i = 0; i < teamSettings.teams.length; i++) {
      if (teamSettings.teams[i].id === teamID) {
        for (let j = 0; j < teamSettings.teams[i].players.length; j++) {
          if (teamSettings.teams[i].players[j].isHost) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function deletePlayer(playerToDelete) {
    setTeamSettings((prevState) => {
      return {
        ...prevState,
        teams: prevState.teams.map((team) => ({
          teamName: team.teamName,
          id: team.id,
          players: team.players.filter(
            (player) => player.id !== playerToDelete
          ),
        })),
      };
    });
  }

  function addTeam() {
    if (teamSettings.teams.length < 10) {
      setTeamSettings({
        ...teamSettings,
        teams: teamSettings.teams.concat({
          teamName: randomAnimal(),
          id: generateID(),
          players: [
            // { name: "Sarah", isHost: false, id: generateID() },
            // { name: "Anne", isHost: false, id: generateID() },
            // { name: "Frank", isHost: false, id: generateID() },
            // { name: "Jack", isHost: false, id: generateID() },
          ],
        }),
      });
    } else {
      console.log("You don't have that many friends! Stop adding teams...");
    }
  }

  function checkTeamsValid() {
    return (
      teamSettings.teams.length > 1 &&
      !teamSettings.teams.filter((team) => team.players.length < 2).length
    );
  }

  async function startGame() {
    const gameRef = await db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID);
    const teamsForGame = teamSettings.teams.map((team) => ({
      ...team,
      describerIndex: 0,
      score: 0,
    }));
    const wordsRef = await db.collection("Words").doc("WordPack");
    const wordsDoc = await wordsRef.get();
    let randomInt = await Math.floor(Math.random() * 2993); // TODO: Fix this hardcoded value....
    let randomWord = await wordsDoc.data().wordsArray[randomInt];
    await gameRef.set(
      {
        gameMode: gameSettings.gameMode,
        turnLimit: gameSettings.turnLimit,
        scoreLimit: gameSettings.scoreLimit,
        secondsPerRound: gameSettings.secondsPerRound,
        buzzPenalty: gameSettings.buzzPenalty,
        skipPenalty: gameSettings.skipPenalty,
        correctReward: gameSettings.correctReward,
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
          dataForTeamsContainer={teamSettings}
          deleteTeam={deleteTeam}
          deletePlayer={deletePlayer}
        ></TeamsContainer>

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
