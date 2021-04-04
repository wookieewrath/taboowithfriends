import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import { db } from "../constants";
import { Link, useHistory, Redirect } from "react-router-dom";
import HostView from "./HostView";
import { generateID } from "../id";
import { randomAnimal } from "../animal";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#ffac12",
    },
  },

});

const newPlayerID = generateID();

function LandingPage() {
  const [nameInput, setNameInput] = useState("");
  const [newRoomID, setNewRoomID] = useState("");
  const [existingRoomID, setExistingRoomID] = useState("");

  const [redirectHost, setRedirectHost] = useState(false);
  const [redirectPlayer, setRedirectPlayer] = useState(false);

  const [roomAlert, setRoomAlert] = useState(false);


  const handleCreateSubmit = async (e) => {
    const gameRef = await db.collection("Games").doc(newRoomID);
    setNewRoomID(gameRef.id);
    const gameSettings = {
      gameMode: "turn",
      turnLimit: 5,
      scoreLimit: 21,
      secondsPerRound: 90,
      buzzPenalty: -2,
      skipPenalty: -1,
      correctReward: 2,
    };
    const teamSettings = {
      teams: [
        {
          teamName: randomAnimal(),
          id: generateID(),
          players: [
            { name: `${nameInput} (Host)`, isHost: true, id: newPlayerID },
          ],
        },
        {
          teamName: randomAnimal(),
          id: generateID(),
          players: [],
        },
      ],
    };
    await gameRef.set({ gameSettings }, { merge: true });
    await gameRef.set({ teamSettings }, { merge: true });
    setRedirectHost(true);
  };

  const handleJoinSubmit = async (e) => {
    const gameRef = await db.collection("Games").doc(existingRoomID);
    const doc = await gameRef.get();
    if (!doc.exists) {
      setRoomAlert(true);
    } else {
      console.log(doc.data().teamSettings);
      var updatedTeam = doc.data().teamSettings.teams;
      updatedTeam[0].players.push({
        name: nameInput,
        isHost: false,
        id: newPlayerID,
      });
      console.log(updatedTeam);
      const teams = updatedTeam
      await gameRef.update({teamSettings: {teams}})
      setRedirectPlayer(true)
    }
  };

  if (redirectHost) {
    return (
      <Redirect
        to={{
          pathname: `/host/${newRoomID}/${newPlayerID}`,
          state: { hostName: nameInput },
        }}
      />
    );
  } else if (redirectPlayer) {
    return (
      <Redirect
        to={{
          pathname: `/play/${existingRoomID}/${newPlayerID}`,
          state: { playerName: nameInput },
        }}
      />
    );
  } else {
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Typography variant="h4">
            Welcome to taboowithfriends!
            <Typography variant="caption">BETA</Typography>
          </Typography>

          <TextField
            color="secondary"
            label="What's your name?"
            inputProps={{
              style: { textAlign: "center", textTransform: "capitalize" },
            }}
            onChange={(e) => {
              setNameInput(e.target.value);
            }}
            value={nameInput}
          />
          <p></p>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                style={{ margin: 15, backgroundColor: "#ffac12" }}
                onClick={handleCreateSubmit}
                disabled={!newRoomID || !nameInput}
              >
                CREATE GAME
              </Button>

              <div>
                <TextField
                  onChange={(e) =>
                    setNewRoomID(e.target.value.replace(/\s/g, ""))
                  }
                  value={newRoomID}
                  variant="outlined"
                  placeholder="New Room ID"
                  style={{ margin: 8 }}
                  color="secondary"
                  inputProps={{ style: { textAlign: "center" } }}
                ></TextField>
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                style={{ margin: 15, backgroundColor: "#ffac12" }}
                onClick={handleJoinSubmit}
                disabled={!existingRoomID || !nameInput}
              >
                JOIN GAME
              </Button>

              <div>
                <TextField
                  onChange={(e) => {
                    setRoomAlert(false);
                    setExistingRoomID(e.target.value.replace(/\s/g, ""));
                  }}
                  value={existingRoomID}
                  variant="outlined"
                  placeholder="Existing Room ID"
                  style={{ margin: 8 }}
                  color="secondary"
                  inputProps={{ style: { textAlign: "center" } }}
                  error={roomAlert}
                  helperText={roomAlert ? `Room does not exist` : ``}
                ></TextField>
              </div>
            </Grid>
          </Grid>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default LandingPage;
