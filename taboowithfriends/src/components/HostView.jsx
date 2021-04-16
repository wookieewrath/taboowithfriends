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

const mockData = {
  someLargeTeamIdentifier: [
    {
      teamName: "Mongoose",
      players: [
        { name: "Billy", isHost: false },
        { name: "Frank", isHost: false },
      ],
    },
    {
      teamName: "Badger",
      players: [
        { name: "Jim", isHost: false },
        { name: "Tim", isHost: false },
        { name: "Sharon", isHost: true },
        { name: "Bob", isHost: false },
        { name: "Mike", isHost: false },
      ],
    },
    {
      teamName: "Muskrat",
      players: [
        { name: "Joe", isHost: false },
        { name: "Tom", isHost: false },
      ],
    },
    {
      teamName: "Ferrett",
      players: [
        { name: "Jake", isHost: false },
        { name: "Susan", isHost: false },
        { name: "Sam", isHost: false },
      ],
    },
    {
      teamName: "Bear",
      players: [
        { name: "Sally", isHost: false },
        { name: "Ashley", isHost: false },
      ],
    },
    {
      teamName: "Weasel",
      players: [
        { name: "Sarah", isHost: false },
        { name: "Anne", isHost: false },
        { name: "Frank", isHost: false },
        { name: "Jack", isHost: false },
      ],
    },
  ],
};


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

function HostView() {

  const classes = useStyles();

  const [gameSettings, setGameSettings] = useState({
    gameMode: "turn",
    turnLimit: 5,
    scoreLimit: 21,
    secondsPerRound: 90,
    buzzPenalty: -2,
    skipPenalty: -1,
    correctReward: 2,
  });

  const [mockStatefulData, setMockStatefulData] = useState(mockData);

  function deleteTeam(teamToDelete) {
    setMockStatefulData((prevState) => {
      if (prevState.someLargeTeamIdentifier.length > 2) {
        return {
          ...prevState,
          someLargeTeamIdentifier: prevState.someLargeTeamIdentifier.filter(
            (x) => x.teamName !== teamToDelete
          ),
        };
      } else {
        console.log("There must be at least two teams!");
        return {
          ...prevState,
        };
      }
    });
  }

  function deletePlayer(playerToDelete) {
    setMockStatefulData((prevState) => {
      return {
        ...prevState,
        someLargeTeamIdentifier: prevState.someLargeTeamIdentifier.map((x) => ({
          teamName: x.teamName,
          players: x.players.filter((y) => y.name !== playerToDelete),
        })),
      };
    });
  }

  function addTeam(){
    setMockStatefulData((prevState) => {
        if (prevState.someLargeTeamIdentifier.length < 10) {
            return {
              ...prevState,
              someLargeTeamIdentifier: prevState.someLargeTeamIdentifier.concat(
                {
                    teamName: "Weasel",
                    players: [
                      { name: "Sarah", isHost: false },
                      { name: "Anne", isHost: false },
                      { name: "Frank", isHost: false },
                      { name: "Jack", isHost: false },
                    ]
                }
              )
            };
            
          } else {
            console.log("You don't have that many friends! Stop adding teams...");
            return {
              ...prevState,
            };
          }
    })
  }

  useEffect(() => {
    console.log(mockStatefulData)
    console.log("A change happend :o !");
  }, [mockStatefulData]);

  useEffect(() => {
    console.log("Game Mode: " + gameSettings.gameMode);
    console.log("Turn Limit: " + gameSettings.turnLimit);
    console.log("Score Limit: " + gameSettings.scoreLimit);
    console.log("Seconds Per Round: " + gameSettings.secondsPerRound);
    console.log("Buzz Penalty: " + gameSettings.buzzPenalty);
    console.log("Skip Penalty: " + gameSettings.skipPenalty);
    console.log("Correct Reward: " + gameSettings.correctReward);
    console.log("");
  }, [gameSettings]);

  return (
    <MuiThemeProvider theme={theme}>
      <div>Your Room ID:</div>
      <div>RTCBV</div>
      <p></p>
      <div className={classes.root}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Game Mode</FormLabel>
          <RadioGroup
            aria-label="Game Mode"
            name="Game Mode"
            value={gameSettings.gameMode}
            onChange={(e, newVal) =>
              setGameSettings({ ...gameSettings, gameMode: e.target.value })
            }
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
          onChange={(e, newVal) =>
            setGameSettings({ ...gameSettings, turnLimit: newVal })
          }
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
          onChange={(e, newVal) =>
            setGameSettings({ ...gameSettings, scoreLimit: newVal })
          }
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
          onChange={(e, newVal) =>
            setGameSettings({ ...gameSettings, secondsPerRound: newVal })
          }
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
          onChange={(e, newVal) =>
            setGameSettings({ ...gameSettings, buzzPenalty: newVal })
          }
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
          onChange={(e, newVal) =>
            setGameSettings({ ...gameSettings, skipPenalty: newVal })
          }
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
          onChange={(e, newVal) =>
            setGameSettings({ ...gameSettings, correctReward: newVal })
          }
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
        dataForTeamsContainer={mockStatefulData}
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
    </MuiThemeProvider>
  );
}

export default HostView;
