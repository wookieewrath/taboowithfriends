import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../constants";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { isEqual, isUndefined, random } from "lodash";
import ScoreCard from "./ScoreCard";
import firebase from "firebase/app";
import "firebase/firestore";
import Confetti from "react-dom-confetti";
import { useHistory } from "react-router-dom";

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#ffac12",
    },
  },
});

function GameView({ match, location }) {
  const [lobbyID, setLobbyID] = useState(sessionStorage.getItem("lobbyID"));
  const [gameID, setGameID] = useState(sessionStorage.getItem("gameID"));
  const [playerID, setPlayerID] = useState(
    parseInt(sessionStorage.getItem("playerID"), 10)
  );
  const [gameConfig, setGameConfig] = useState("loading");
  const [secondsLeft, setSecondsLeft] = useState();
  const [wordPackLength, setWordPackLength] = useState(0);
  const [active, setActive] = useState(false);
  const [intervalID, setIntervalID] = useState(null);
  let history = useHistory();

  useEffect(async () => {
    const wordsRef = await db.collection("Words").doc("WordPack");
    const doc = await wordsRef.get();
    setWordPackLength(doc.data().length);
    const playingSnapshot = db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .onSnapshot((doc) => {
        setGameConfig((prevGameConfig) => {
          const newGameConfig = doc.data();
          if (
            prevGameConfig === "loading" &&
            doc.data().roundEndTime !== -1 &&
            isTeamActive2(doc.data()) &&
            isDescriber2(doc.data())
          ) {
            console.log("ayy");
            startTimer();
          }
          return newGameConfig;
        });
      });
    return playingSnapshot;
  }, []);

  async function pauseRound() {
    //TODO
  }

  async function endRound() {
    const endDocRef = db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID);
    const data_1 = await endDocRef.get();
    console.log("end round", gameConfig);

    if (!isUndefined(data_1.data())) {
      await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Games")
        .doc(gameID)
        .update({
          roundEndTime: -1,
          inRound: false,
          activeTeam: data_1.data().activeTeam + 1,
          teams: data_1.data().teams.map((team) => ({
            ...team,
            describerIndex:
              team.id ===
              data_1.data().teams[
                data_1.data().activeTeam % data_1.data().teams.length
              ].id
                ? (team.describerIndex = team.describerIndex + 1)
                : team.describerIndex,
          })),
        });

      const data_2 = await endDocRef.get();

      if (data_2.data().activeTeam % data_2.data().teams.length === 0) {
        await db
          .collection("Lobbies")
          .doc(lobbyID)
          .collection("Games")
          .doc(gameID)
          .update({
            roundNumber: data_2.data().roundNumber + 1,
          });
      }
      const data_3 = await endDocRef.get();

      //update word
      let randomInt = 0;
      do randomInt = Math.floor(Math.random() * (wordPackLength - 1));
      while (data_3.data().wordsUsed.includes(randomInt));
      db.collection("Lobbies")
        .doc(lobbyID)
        .collection("Games")
        .doc(gameID)
        .update({
          wordsUsed: firebase.firestore.FieldValue.arrayUnion(randomInt),
        });
      const wordsRef = await db.collection("Words").doc("WordPack");
      const doc = await wordsRef.get();
      db.collection("Lobbies")
        .doc(lobbyID)
        .collection("Games")
        .doc(gameID)
        .update({ currentWord: doc.data().wordsArray[randomInt] });
      //

      if (
        data_3.data().gameMode === "turn" &&
        data_3.data().roundNumber > data_3.data().turnLimit &&
        data_3.data().activeTeam % data_3.data().teams.length === 0
      ) {
        setWinningTeam();
        await db
          .collection("Lobbies")
          .doc(lobbyID)
          .collection("Games")
          .doc(gameID)
          .update({
            gameOver: true,
          });
      }
      if (
        data_3.data().gameMode === "score" &&
        data_3
          .data()
          .teams.filter((team) => team.score > data_3.data().scoreLimit)
          .length > 0 &&
        data_3.data().activeTeam % data_3.data().teams.length === 0
      ) {
        setWinningTeam();
        await db
          .collection("Lobbies")
          .doc(lobbyID)
          .collection("Games")
          .doc(gameID)
          .update({
            gameOver: true,
          });
      }
    }
  }

  async function startTimer() {
    const docref = db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID);
    const docref2 = await docref.get();
    setGameConfig(docref2.data());

    if (docref2.data().roundEndTime === -1) {
      await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Games")
        .doc(gameID)
        .update({
          roundEndTime: Date.now() + gameConfig.secondsPerRound * 1000,
        });
    }

    const endTime = docref2.data().roundEndTime;

    setIntervalID(
      setInterval(() => {
        if (endTime - Date.now() > 0) {
          setSecondsLeft(Math.floor((endTime - Date.now()) / 1000));
        }
      }, 1000)
    );

    setTimeout(async () => {
      clearInterval(intervalID);
      setIntervalID(-1);
    }, docref2.data().roundEndTime - Date.now());
  }

  useEffect(() => {
    if (intervalID === -1) {
      endRound();
    }
  }, [intervalID]);

  async function startRound() {
    await db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .update({
        inRound: true,
        roundEndTime: Date.now() + gameConfig.secondsPerRound * 1000,
      });
    startTimer();
  }

  function whatTeam(playerID) {
    const teams = gameConfig.teams;
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams[i].players.length; j++) {
        if (isEqual(teams[i].players[j].id, playerID)) {
          return teams[i].id;
        }
      }
    }
    return false;
  }

  async function grabWord() {
    let randomInt = 0;
    do randomInt = Math.floor(Math.random() * (wordPackLength - 1));
    while (gameConfig.wordsUsed.includes(randomInt));
    db.collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .update({
        wordsUsed: firebase.firestore.FieldValue.arrayUnion(randomInt),
      });
    const wordsRef = await db.collection("Words").doc("WordPack");
    const doc = await wordsRef.get();
    await db
      .collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .update({ currentWord: doc.data().wordsArray[randomInt] });
  }

  function isTeamActive() {
    return (
      gameConfig !== "loading" &&
      gameConfig.teams[
        gameConfig.activeTeam % gameConfig.teams.length
      ].players.filter((player) => player.id === playerID).length > 0
    );
  }

  function isTeamActive2(foo) {
    return (
      foo !== "loading" &&
      foo.teams[foo.activeTeam % foo.teams.length].players.filter(
        (player) => player.id === playerID
      ).length > 0
    );
  }

  function isRoundActive() {
    return gameConfig !== "loading" && gameConfig.inRound;
  }

  function isDescriber() {
    const teamIndex = gameConfig.activeTeam % gameConfig.teams.length;
    const currentPlayers = gameConfig.teams[teamIndex].players;
    return (
      gameConfig !== "loading" &&
      !isUndefined(gameConfig) &&
      isTeamActive() &&
      !!gameConfig.teams.find(
        (team) =>
          team.players[team.describerIndex % currentPlayers.length].id ===
          playerID
      )
    );
  }

  function isDescriber2(foo) {
    const teamIndex = foo.activeTeam % foo.teams.length;
    const currentPlayers = foo.teams[teamIndex].players;
    return (
      foo !== "loading" &&
      !isUndefined(foo) &&
      !!foo.teams.find(
        (team) =>
          team.players[team.describerIndex % currentPlayers.length].id ===
          playerID
      )
    );
  }

  function getArrayOfTeammates(playerID) {
    return gameConfig.teams
      .find((team) => team.players.find((player) => player.id === playerID))
      .players.filter((player) => player.id !== playerID)
      .map((player) => player.name);
  }

  function getCurrentDescriberID() {
    const currentDescriberIndex =
      gameConfig.teams[gameConfig.activeTeam % gameConfig.teams.length]
        .describerIndex;
    const teamIndex = gameConfig.activeTeam % gameConfig.teams.length;
    const currentPlayers = gameConfig.teams[teamIndex].players;
    return gameConfig.teams[teamIndex].players[
      currentDescriberIndex % currentPlayers.length
    ].id;
  }

  function getCurrentDescriberName() {
    const currentDescriberIndex =
      gameConfig.teams[gameConfig.activeTeam % gameConfig.teams.length]
        .describerIndex;
    const teamIndex = gameConfig.activeTeam % gameConfig.teams.length;
    const currentPlayers = gameConfig.teams[teamIndex].players;
    return gameConfig.teams[gameConfig.activeTeam % gameConfig.teams.length]
      .players[currentDescriberIndex % currentPlayers.length].name;
  }

  async function buzzWord() {
    db.collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .update({
        teams: gameConfig.teams.map((team) => ({
          ...team,
          score:
            team.id === whatTeam(playerID)
              ? (team.score = team.score + gameConfig.buzzPenalty)
              : team.score,
        })),
      });

    grabWord();
  }

  async function correctWord() {
    db.collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .update({
        teams: gameConfig.teams.map((team) => ({
          ...team,
          score:
            team.id === whatTeam(playerID)
              ? (team.score = team.score + gameConfig.correctReward)
              : team.score,
        })),
      });
    // console.log(gameConfig);

    grabWord();
  }

  async function skipWord() {
    db.collection("Lobbies")
      .doc(lobbyID)
      .collection("Games")
      .doc(gameID)
      .update({
        teams: gameConfig.teams.map((team) => ({
          ...team,
          score:
            team.id === whatTeam(playerID)
              ? (team.score = team.score + gameConfig.skipPenalty)
              : team.score,
        })),
      });

    grabWord();
  }

  async function isGameOver() {
    if (
      gameConfig.gameMode === "turn" &&
      gameConfig.roundNumber === gameConfig.turnLimit &&
      gameConfig.activeTeam % gameConfig.teams.length === 0
    ) {
      setWinningTeam();
      await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Games")
        .doc(gameID)
        .update({
          gameOver: true,
        });
    }
    if (
      gameConfig.gameMode === "score" &&
      gameConfig.teams.filter((team) => team.score >= gameConfig.scoreLimit)
        .length > 0 &&
      gameConfig.activeTeam % gameConfig.teams.length === 0
    ) {
      setWinningTeam();
      await db
        .collection("Lobbies")
        .doc(lobbyID)
        .collection("Games")
        .doc(gameID)
        .update({
          gameOver: true,
        });
    }
  }

  async function setWinningTeam() {
    let largestScore = Math.max(...gameConfig.teams.map((team) => team.score));
    let winningArray = gameConfig.teams.filter((team) =>
      team.score === largestScore ? team.teamName : null
    );
    if (winningArray.length >= 2) {
      db.collection("Lobbies")
        .doc(lobbyID)
        .collection("Games")
        .doc(gameID)
        .update({
          winningTeam: "TIE",
        });
    } else {
      db.collection("Lobbies")
        .doc(lobbyID)
        .collection("Games")
        .doc(gameID)
        .update({
          winningTeam: winningArray[0].teamName,
        });
    }
  }

  if (gameConfig === "loading") {
    return <h1>Loading...</h1>;
  } else if (gameConfig.gameOver) {
    setWinningTeam();
    const config = {
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
    return (
      <MuiThemeProvider theme={theme}>
        <Typography variant="h3">Game Over!</Typography>

        <Confetti
          ref={() => {
            setActive(true);
          }}
          active={active}
          config={config}
        />

        <Typography variant="h5" style={{ marginBottom: 20 }}>
          Winning Team: {gameConfig.winningTeam}!
        </Typography>

        <Grid container spacing={1} justify="center" alignItems="center">
          {gameConfig.teams.map((team) => (
            <ScoreCard
              key={team.id}
              teamName={team.teamName}
              playerNames={team.players.map((player) => player.name).join(", ")}
              score={team.score}
              gameMode={gameConfig.gameMode}
              scoreLimit={gameConfig.scoreLimit}
              turnLimit={gameConfig.turnLimit}
              currentRound={gameConfig.roundNumber}
            />
          ))}
        </Grid>
        <Button
          style={{
            width: 230,
            height: 50,
            backgroundColor: "#ffbf47",
            fontWeight: "bold",
            margin: 15,
          }}
          onClick={() => {
            history.push("/");
          }}
        >
          Return to Landing Page
        </Button>
      </MuiThemeProvider>
    );
  } else if (isRoundActive() && isTeamActive() && isDescriber()) {
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <Typography
            variant="h4"
            style={{
              position: "absolute",
              top: 9,
              right: 16,
              margin: 5,
              color: "DimGrey",
            }}
          >
            {secondsLeft || ""}
          </Typography>

          {/* <IconButton
            style={{
              width: 50,
              height: 50,
              margin: 5,
              position: "absolute",
              top: 4,
              right: 90,
              margin: 5,
              color: "DimGrey",
            }}
            onClick={pauseRound}
          >
            <PauseIcon style={{ width: 35, height: 35 }}></PauseIcon>
          </IconButton> */}

          <Card style={{ width: 250, height: 300, padding: 15, margin: 5 }}>
            <Typography
              variant="h4"
              style={{ marginTop: 20, marginBottom: 25 }}
            >
              {gameConfig.currentWord.title}
            </Typography>

            {gameConfig.currentWord.badwords.split(",").map((badword) => (
              <Typography
                key={badword}
                variant="h5"
                style={{ margin: 5, color: "DimGrey" }}
              >
                {badword}
              </Typography>
            ))}
          </Card>

          <IconButton
            style={{ width: 70, height: 70, margin: 5 }}
            onClick={buzzWord}
          >
            <CloseIcon
              style={{ width: 50, height: 50, fill: "OrangeRed" }}
            ></CloseIcon>
          </IconButton>
          <IconButton
            style={{ width: 70, height: 70, margin: 5 }}
            onClick={skipWord}
          >
            <SkipNextIcon
              style={{ width: 50, height: 50, fill: "DimGrey" }}
            ></SkipNextIcon>
          </IconButton>
          <IconButton
            style={{ width: 70, height: 70, margin: 5 }}
            onClick={correctWord}
          >
            <CheckIcon
              style={{ width: 50, height: 50, fill: "LimeGreen" }}
            ></CheckIcon>
          </IconButton>
        </div>
      </MuiThemeProvider>
    );
  } else if (!isRoundActive() && !isTeamActive()) {
    return (
      <div>
        <h3>
          {getCurrentDescriberName()} will be reading to:{" "}
          {getArrayOfTeammates(getCurrentDescriberID()).join(", ")}
        </h3>
        <h4>Waiting for {getCurrentDescriberName()} to start...</h4>
        <br />
        <Grid container spacing={1} justify="center" alignItems="center">
          {gameConfig.teams.map((team) => (
            <ScoreCard
              key={team.id}
              teamName={team.teamName}
              playerNames={team.players.map((player) => player.name).join(", ")}
              score={team.score}
              gameMode={gameConfig.gameMode}
              scoreLimit={gameConfig.scoreLimit}
              turnLimit={gameConfig.turnLimit}
              currentRound={gameConfig.roundNumber}
            />
          ))}
        </Grid>
        <h6 style={{ margin: 20 }}>
          {gameConfig.gameMode === "turn"
            ? `Currently on round ${gameConfig.roundNumber} of ${gameConfig.turnLimit}`
            : null}
        </h6>
      </div>
    );
  } else if (!isRoundActive() && isTeamActive() && isDescriber()) {
    return (
      <div>
        <h3>
          You will be reading to:{" "}
          {getArrayOfTeammates(getCurrentDescriberID()).join(", ")}
        </h3>
        <Button
          style={{
            width: 175,
            height: 50,
            backgroundColor: "#ffbf47",
            fontWeight: "bold",
            margin: 15,
          }}
          onClick={startRound}
        >
          Start Round
        </Button>
        <br />

        <br />
        <Grid container spacing={1} justify="center" alignItems="center">
          {gameConfig.teams.map((team) => (
            <ScoreCard
              key={team.id}
              teamName={team.teamName}
              playerNames={team.players.map((player) => player.name).join(", ")}
              score={team.score}
              gameMode={gameConfig.gameMode}
              scoreLimit={gameConfig.scoreLimit}
              turnLimit={gameConfig.turnLimit}
              currentRound={gameConfig.roundNumber}
            />
          ))}
        </Grid>
        <h6 style={{ margin: 20 }}>
          {gameConfig.gameMode === "turn"
            ? `Currently on round ${gameConfig.roundNumber} of ${gameConfig.turnLimit}`
            : null}
        </h6>
      </div>
    );
  } else if (!isRoundActive() && isTeamActive() && !isDescriber()) {
    return (
      <div>
        <h3>
          Get ready! {getCurrentDescriberName()} will be describing words to
          you.
        </h3>
        <h4>Waiting for {getCurrentDescriberName()} to start...</h4>
        <br />
        <Grid container spacing={1} justify="center" alignItems="center">
          {gameConfig.teams.map((team) => (
            <ScoreCard
              key={team.id}
              teamName={team.teamName}
              playerNames={team.players.map((player) => player.name).join(", ")}
              score={team.score}
              gameMode={gameConfig.gameMode}
              scoreLimit={gameConfig.scoreLimit}
              turnLimit={gameConfig.turnLimit}
              currentRound={gameConfig.roundNumber}
            />
          ))}
        </Grid>
        <h6 style={{ margin: 20 }}>
          {gameConfig.gameMode === "turn"
            ? `Currently on round ${gameConfig.roundNumber} of ${gameConfig.turnLimit}`
            : null}
        </h6>
      </div>
    );
  } else if (isRoundActive() && !isTeamActive()) {
    return (
      <MuiThemeProvider theme={theme}>
        <Typography
          variant="h4"
          style={{
            position: "absolute",
            top: 9,
            right: 16,
            margin: 5,
            color: "DimGrey",
          }}
        >
          {}
        </Typography>
        <Grid container direction="column" justify="center" alignItems="center">
          <Grid item xs={12}>
            <h3>
              {getCurrentDescriberName()} is describing this word to:{" "}
              {getArrayOfTeammates(getCurrentDescriberID()).join(", ")}
            </h3>
            <h5>
              If {getCurrentDescriberName()} says a banned word, call it out!
            </h5>{" "}
          </Grid>

          <Grid item>
            <Card style={{ width: 250, height: 300, padding: 15, margin: 5 }}>
              <Typography
                variant="h4"
                style={{ marginTop: 20, marginBottom: 25 }}
              >
                {gameConfig.currentWord.title}
              </Typography>

              {gameConfig.currentWord.badwords.split(",").map((badword) => (
                <Typography
                  key={badword}
                  variant="h5"
                  style={{ margin: 5, color: "DimGrey" }}
                >
                  {badword}
                </Typography>
              ))}
            </Card>
          </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  } else if (isRoundActive() && isTeamActive() && !isDescriber()) {
    // inRound && activeTeam && !describer
    return (
      <MuiThemeProvider theme={theme}>
        <Card
          style={{
            width: 250,
            height: 300,
            padding: 15,
            margin: 5,
            verticalAlign: "middle",
          }}
        >
          <Typography variant="h4" style={{ marginTop: 70, marginBottom: 25 }}>
            Think fast!
          </Typography>
          <Typography variant="h5" style={{ marginTop: 20, marginBottom: 25 }}>
            {getCurrentDescriberName()} is describing words to you!
          </Typography>
        </Card>
      </MuiThemeProvider>
    );
  }
}

export default GameView;
