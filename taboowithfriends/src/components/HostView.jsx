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
  const animals = [
    "Hedgehog",
    "Weasel",
    "Mongoose",
    "Muskrat",
    "Ferrett",
    "Otter",
    "Shrew",
    "Capybara",
    "Red Panda",
    "Porcupine",
  ];
  const classes = useStyles();
  const [gameID, setGameID] = useState( match.params.roomID);
  const [hostID, setHostID] = useState(match.params.playerID);
  const [gameSettings, setGameSettings] = useState({});
  const [teamSettings, setTeamSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const isFirstRun = useRef(true);

  useEffect(async () => {
    if (isFirstRun.current) {
      const gameRef = await db.collection("Games").doc(gameID);
      const myfoo = (await gameRef.get()).data();
      setGameSettings(myfoo.gameSettings);
      console.log(myfoo);
      gameRef.onSnapshot((doc) => {
        isFirstRun.current = false;
        setTeamSettings(doc.data().teamSettings);

        setIsLoading(false);
      });
      return;
    }
  }, []);

  const prevGame = usePrevious(gameSettings);
  const prevTeam = usePrevious(teamSettings);

  useEffect(() => {
    if (!isFirstRun.current) {
      if (
        !isEqual(prevGame, gameSettings) ||
        !isEqual(prevTeam, teamSettings)
      ) {
        console.log("Change!");
        db.collection("Games")
          .doc(gameID)
          .set({ gameSettings }, { merge: true });
        db.collection("Games")
          .doc(gameID)
          .set({ teamSettings }, { merge: true });
      }
    }
  }, [gameSettings, teamSettings]);

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  function deleteTeam(teamToDelete) {
    setTeamSettings((prevState) => {
      if (prevState.teams.length > 2) {
        if (!containsHost(teamToDelete)) {
          return {
            ...prevState,
            teams: prevState.teams.filter((x) => x.id !== teamToDelete),
          };
        } else {
          console.log("The host is on that team!");
          return {
            ...prevState,
          };
        }
      } else {
        console.log("There must be at least two teams!");
        return {
          ...prevState,
        };
      }
    });
  }

  function containsHost(teamID) {
    for (var i = 0; i < teamSettings.teams.length; i++) {
      if (teamSettings.teams[i].id === teamID) {
        console.log("players", teamSettings.teams[i].players);
        for (var j = 0; j < teamSettings.teams[i].players.length; j++) {
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
        teams: prevState.teams.map((x) => ({
          teamName: x.teamName,
          id: x.id,
          players: x.players.filter((y) => y.id !== playerToDelete),
        })),
      };
    });
  }

  function addTeam() {
    setTeamSettings((prevState) => {
      if (prevState.teams.length < 10) {
        return {
          ...prevState,
          teams: prevState.teams.concat({
            teamName: randomAnimal(),
            id: generateID(),
            players: [
              { name: "Sarah", isHost: false, id: generateID() },
              { name: "Anne", isHost: false, id: generateID() },
              { name: "Frank", isHost: false, id: generateID() },
              { name: "Jack", isHost: false, id: generateID() },
            ],
          }),
        };
      } else {
        console.log("You don't have that many friends! Stop adding teams...");
        return {
          ...prevState,
        };
      }
    });
  }

  if (isLoading) {
    return <h1>Loading...</h1>;
  } else
    return (
      <MuiThemeProvider theme={theme}>
        <p></p>
        <div>Your Room ID:</div>
        <div>{gameID}</div>
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
        >
          Start Game!
        </Button>
        <p></p>
      </MuiThemeProvider>
    );
}

export default HostView;
