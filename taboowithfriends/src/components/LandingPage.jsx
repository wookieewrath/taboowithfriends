import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React, { useState } from "react";
import { Redirect } from "react-router-dom";
import { randomAnimal } from "../animal";
import { db, defaultGameSettings } from "../constants";
import { generateID } from "../id";
import FavoriteIcon from "@material-ui/icons/Favorite";
import GitHubIcon from "@material-ui/icons/GitHub";
import MailIcon from "@material-ui/icons/Mail";
import HelpIcon from "@material-ui/icons/Help";
import IconButton from "@material-ui/core/IconButton";
import Acknowledgements from "./Acknowledgements";

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
  const [newGameID, setNewGameID] = useState("");
  const [redirectHost, setRedirectHost] = useState(false);
  const [redirectPlayer, setRedirectPlayer] = useState(false);
  const [roomAlert, setRoomAlert] = useState(false);
  const [openAcknowledgements, setOpenAcknowledgements] = useState(false);
  const [disabledStart, setDisabledStart] = useState(false);

  const handleCreateSubmit = async (e) => {
    setDisabledStart(true);
    const lobbyRef = await db.collection("Lobbies").doc(newRoomID);
    setNewRoomID(lobbyRef.id);
    const gameRef = await db.collection("Lobbies").doc(newRoomID).collection("Games").add({ playing: "lobby" });
    setNewGameID(gameRef.id);
    console.log(gameRef);
    const gameSettings = defaultGameSettings;
    const teamSettings = {
      teams: [
        {
          teamName: randomAnimal(),
          id: generateID(),
          players: [{ name: nameInput, isHost: true, id: newPlayerID }],
        },
        {
          teamName: randomAnimal(),
          id: generateID(),
          players: [],
        },
      ],
    };
    await lobbyRef.set({ gameSettings }, { merge: true });
    await lobbyRef.set({ teamSettings }, { merge: true });
    setRedirectHost(true);
  };

  const handleJoinSubmit = async (e) => {
    setDisabledStart(true);
    const lobbyRef = await db.collection("Lobbies").doc(existingRoomID);
    const gameRef = await db.collection("Lobbies").doc(existingRoomID).collection("Games");
    const lobbyID = await gameRef.where("playing", "==", "lobby").get();
    if (lobbyID && lobbyID.docs && lobbyID.docs[0]) {
      setNewGameID(lobbyID.docs[0].id);
    } else {
      setDisabledStart(false);
      console.log("That lobby ID doesn't exist!", lobbyID);
    }
    const doc = await lobbyRef.get();
    if (!doc.exists) {
      setRoomAlert(true);
    } else {
      const updatedTeam = doc.data().teamSettings.teams;
      updatedTeam[0].players.push({
        name: nameInput,
        isHost: false,
        id: newPlayerID,
      });
      await lobbyRef.update({ teamSettings: { teams: updatedTeam } }).then(setRedirectPlayer(true));
    }
  };

  if (redirectHost) {
    sessionStorage.setItem("playerID", newPlayerID);
    sessionStorage.setItem("lobbyID", newRoomID);
    sessionStorage.setItem("gameID", newGameID);
    return (
      <Redirect
        to={{
          pathname: `/host`,
          state: { hostName: nameInput },
        }}
      />
    );
  } else if (redirectPlayer) {
    sessionStorage.setItem("playerID", newPlayerID);
    sessionStorage.setItem("lobbyID", existingRoomID);
    sessionStorage.setItem("gameID", newGameID);
    return (
      <Redirect
        to={{
          pathname: `/play`,
          state: { playerName: nameInput },
        }}
      />
    );
  } else {
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Typography variant="h4">
            Welcome to taboowithfriends🥳!
            <Typography variant="caption">BETA</Typography>
          </Typography>

          <TextField
            color="secondary"
            label="What's your name?"
            inputProps={{
              style: { textAlign: "center", textTransform: "capitalize" },
            }}
            onChange={(e) => {
              setNameInput(e.target.value.toUpperCase());
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
                disabled={!newRoomID || !nameInput || disabledStart}
              >
                CREATE GAME
              </Button>

              <div>
                <TextField
                  onChange={(e) => setNewRoomID(e.target.value.replace(/\s/g, ""))}
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
                disabled={!existingRoomID || !nameInput || disabledStart}
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
          <br />

          <div>
            <Acknowledgements open={openAcknowledgements} setOpenAcknowledgements={setOpenAcknowledgements} />
            {/* <IconButton style={{ width: 50, height: 50, margin: 2 }}>
              <GitHubIcon style={{ width: 30, height: 30, margin: 8, fill: "DimGrey" }}></GitHubIcon>
            </IconButton>
            <IconButton style={{ width: 50, height: 50, margin: 2 }}>
              <MailIcon style={{ width: 30, height: 30, margin: 8, fill: "DimGrey" }}></MailIcon>
            </IconButton>
            <IconButton style={{ width: 50, height: 50, margin: 2 }}>
              <HelpIcon style={{ width: 30, height: 30, margin: 8, fill: "DimGrey" }}></HelpIcon>
            </IconButton> */}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default LandingPage;
