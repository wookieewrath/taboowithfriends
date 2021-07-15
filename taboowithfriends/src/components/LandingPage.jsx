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
import "firebase/firestore";
import firebase from "firebase/app";
import { generateLobbyID } from "../lobbyIDGenerator";
import { isUndefined } from "lodash";

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#ffac12",
    },
  },
});

const newPlayerID = generateID();
let newLobbyID;
let roomID;
let newGameID;

function LandingPage() {
  const [nameInput, setNameInput] = useState("");
  //const [roomID, setRoomID] = useState("");
  const [existingRoomID, setExistingRoomID] = useState("");
  //const [newGameID, setNewGameID] = useState("");
  const [redirectHost, setRedirectHost] = useState(false);
  const [redirectPlayer, setRedirectPlayer] = useState(false);
  const [roomAlert, setRoomAlert] = useState(false);
  const [openAcknowledgements, setOpenAcknowledgements] = useState(false);
  const [disabledStart, setDisabledStart] = useState(false);

  const handleCreateSubmit = async (e) => {
    setDisabledStart(true);
    let doc;
    let lobbyRef;
    async function checkIfExists() {
      newLobbyID = generateLobbyID();
      lobbyRef = await db.collection("Lobbies").doc(newLobbyID);
      doc = await lobbyRef.get();
    }

    await checkIfExists();
    while (isUndefined(doc) || doc.exists) {
      await checkIfExists();
      console.log("uhoh");
    }
    roomID = lobbyRef.id;
    createGame(lobbyRef);
  };

  async function createGame(lobbyRef) {
    const gameRef = await db
      .collection("Lobbies")
      .doc(roomID)
      .collection("Games")
      .add({ playing: "lobby" });

    let teamsRefID;
    await db
      .collection("Lobbies")
      .doc(roomID)
      .collection("Teams")
      .add({ players: [], teamName: randomAnimal() })
      .then((doc) => {
        teamsRefID = doc.id;
      });
    await db
      .collection("Lobbies")
      .doc(roomID)
      .collection("Teams")
      .doc(teamsRefID)
      .set({ id: teamsRefID }, { merge: true });

    let teamsRefID2;
    await db
      .collection("Lobbies")
      .doc(roomID)
      .collection("Teams")
      .add({
        players: [{ name: nameInput, isHost: true, id: newPlayerID }],
        teamName: randomAnimal(),
      })
      .then((doc) => {
        teamsRefID2 = doc.id;
      });
    await db
      .collection("Lobbies")
      .doc(roomID)
      .collection("Teams")
      .doc(teamsRefID2)
      .set({ id: teamsRefID2 }, { merge: true });

    await db
      .collection("Lobbies")
      .doc(roomID)
      .collection("Teams")
      .doc("Float")
      .set({
        id: "Float",
        players: [],
        teamName: "Waiting Room",
      });

    newGameID = gameRef.id;
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
  }

  async function joinGame() {
    setDisabledStart(true);

    const gameRef = await db
      .collection("Lobbies")
      .doc(existingRoomID)
      .collection("Games");

    const lobbyID = await gameRef.where("playing", "==", "lobby").get();

    const lobbyDoc = await db.collection("Lobbies").doc(existingRoomID);
    const doc = await lobbyDoc.get();

    if (!doc.exists) {
      setRoomAlert(true);
      setDisabledStart(false);
    } else {
      if (lobbyID && lobbyID.docs && lobbyID.docs[0]) {
        newGameID = lobbyID.docs[0].id;
      } else {
        setDisabledStart(false);
        console.log("Error :/", lobbyID);
      }

      const floatTeam = await db
        .collection("Lobbies")
        .doc(existingRoomID)
        .collection("Teams")
        .doc("Float");

      floatTeam
        .update({
          players: firebase.firestore.FieldValue.arrayUnion({
            id: newPlayerID,
            isHost: false,
            name: nameInput,
          }),
        })
        .then(setRedirectPlayer(true));
    }
  }

  if (redirectHost) {
    sessionStorage.setItem("playerID", newPlayerID);
    sessionStorage.setItem("lobbyID", newLobbyID);
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
    console.log(newGameID);
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
              style: { textAlign: "center" },
            }}
            onChange={(e) => {
              setNameInput(e.target.value);
            }}
            value={nameInput}
          />
          <p></p>
          <Grid container>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                style={{
                  backgroundColor: "#ffac12",
                  marginTop: "50px",
                  marginBottom: "50px",
                }}
                onClick={handleCreateSubmit}
                disabled={!nameInput || disabledStart}
              >
                Create Lobby
              </Button>
              {/* 
              <div>
                <TextField
                  onChange={(e) =>
                    setRoomID(e.target.value.toUpperCase().replace(/\s/g, ""))
                  }
                  value={roomID}
                  variant="outlined"
                  placeholder="Lobby Name"
                  style={{ margin: 8 }}
                  color="secondary"
                  inputProps={{ style: { textAlign: "center" } }}
                ></TextField>
              </div> */}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                style={{ margin: 15, backgroundColor: "#ffac12" }}
                onClick={joinGame}
                disabled={!existingRoomID || !nameInput || disabledStart}
              >
                JOIN LOBBY
              </Button>

              <div>
                <TextField
                  onChange={(e) => {
                    setRoomAlert(false);
                    setExistingRoomID(
                      e.target.value.toUpperCase().replace(/\s/g, "")
                    );
                  }}
                  value={existingRoomID}
                  variant="outlined"
                  placeholder="Existing Lobby ID"
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
            <Acknowledgements
              open={openAcknowledgements}
              setOpenAcknowledgements={setOpenAcknowledgements}
            />
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
