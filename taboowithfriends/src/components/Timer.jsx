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
import "firebase/firestore";
import firebase from "firebase/app";

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#ffac12",
    },
  },
});

const newPlayerID = generateID();

function Timer() {
  let secondsPerRound = 10;

  async function clearTimer() {
    await db
      .collection("Lobbies")
      .doc("9")
      .collection("Games")
      .doc("7gpnzr5i8F01uHG9nE14")
      .update({
        endTime: Date.now() + 3000,
      });
  }

  async function startTimer() {
    await db
      .collection("Lobbies")
      .doc("9")
      .collection("Games")
      .doc("7gpnzr5i8F01uHG9nE14")
      .update({
        endTime: Date.now() + 5000,
      });

    var docref = db.collection("Lobbies").doc("9").collection("Games").doc("7gpnzr5i8F01uHG9nE14");
    var docref2 = await docref.get();

    setTimeout(() => {
      console.log("hello");
    }, docref2.data().endTime - Date.now());

    var daTime = docref2.data().endTime;

    setInterval(() => {
      if (daTime - Date.now() > 0) {
        console.log(Math.floor((daTime - Date.now()) / 1000));
      }
    }, 1000);
  }

  return (
    <Button
      style={{
        width: 175,
        height: 50,
        backgroundColor: "#ffbf47",
        fontWeight: "bold",
        margin: 15,
      }}
      onClick={startTimer}
    >
      Start Timer
    </Button>
  );
}

export default Timer;
