import React from "react";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    secondary: {
      main: "#ffac12",
    },
  },
});

function ScoreCard({ teamName, playerNames, score, gameMode, scoreLimit, turnLimit, currentRound }) {
  return (
    <MuiThemeProvider theme={theme}>
      <Card style={{ maxWidth: "100vw", minHeight: 20, minWidth: 120, maxWidth: 200, padding: 15, margin: 5 }}>
        <Typography variant="h5" color="secondary">
          {teamName}
        </Typography>
        <Typography variant="body2">{playerNames}</Typography>
        <Typography variant="h6" style={{ marginTop: 15 }}>
          {score} {gameMode === "score" ? "/ " + scoreLimit : null}
        </Typography>
      </Card>
    </MuiThemeProvider>
  );
}

export default ScoreCard;
