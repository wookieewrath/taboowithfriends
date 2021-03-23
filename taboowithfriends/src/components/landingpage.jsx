import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

function LandingPage() {
  const [landingPageRoomId, setLandingPageRoomId] = useState("");
  const [landingPageName, setLandingPageName] = useState("");

  const theme = createMuiTheme({
    palette: {
      secondary: {
        main: '#ffac12'
      }
    }
  });  

  useEffect(() => {
    console.log("Name: " + landingPageName + "  |  Room Id: " + landingPageRoomId);
  }, [landingPageName, landingPageRoomId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(landingPageName, landingPageRoomId);
  };

  return (
    <MuiThemeProvider theme={theme}>
    <div>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            style={{ margin: 15, backgroundColor: "#ffac12" }}
          >
            CREATE GAME
          </Button>{" "}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            style={{ margin: 15, backgroundColor: "#ffac12" }}
            onClick={handleSubmit}
          >
            JOIN GAME
          </Button>
          <div>
            <TextField
              onChange={(e) => setLandingPageName(e.target.value)}
              value={landingPageName}
              variant="outlined"
              label="Name"
              style={{ margin: 8 }}
              color="secondary"
            ></TextField>
          </div>
          <div>
            <TextField
              onChange={(e) => setLandingPageRoomId(e.target.value)}
              value={landingPageRoomId}
              variant="outlined"
              label="Room ID"
              style={{ margin: 8 }}
              color="secondary"
            ></TextField>
          </div>
        </Grid>
      </Grid>
    </div>
    </MuiThemeProvider>
  );
}

export default LandingPage;
