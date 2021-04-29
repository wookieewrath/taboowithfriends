import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import FavoriteIcon from "@material-ui/icons/Favorite";
import Link from "@material-ui/core/Link";
import { Typography } from "@material-ui/core";

export default function Acknowledgements() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <IconButton style={{ width: 50, height: 50, margin: 2 }} onClick={handleClickOpen}>
        <FavoriteIcon style={{ width: 30, height: 30, margin: 8, fill: "DimGrey" }}></FavoriteIcon>
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth={"md"}>
        <DialogTitle style={{ textAlign: "center" }}>{"Acknowledgements"}</DialogTitle>
        <DialogContent>
          <Typography style={{ marginBottom: 3 }}>
            A big thank you to all of the wonderful people who supported me in building this app:
          </Typography>
          <Typography>
            - To my friends, with whom I've been playing this game for nearly a decade <span role="img">👬👬</span>{" "}
          </Typography>
          <Typography>
            - To all of my TM peeps! <span role="img">🐥🍶📌</span>
          </Typography>
          <Typography>
            - To{" "}
            <Link href="http://redbluegames.com/" target="_blank" color="inherit" style={{ fontWeight: "bold" }}>
              RedBlueGames
            </Link>{" "}
            for their support over the years <span role="img">🕹️</span>
          </Typography>
          <Typography>
            - Shout out to{" "}
            <Link href="https://github.com/Celwood93" target="_blank" color="inherit" style={{ fontWeight: "bold" }}>
              Cameron
            </Link>{" "}
            for his guidance <span role="img">🧑‍🏫</span>
          </Typography>
          <br />
          <Typography>This app is a work in progress.</Typography>
          <Typography> For any bug reports or suggestions, please e-mail me at taboowithfriends@gmail.com</Typography>
          <Typography></Typography>

          <Typography style={{ textAlign: "center", marginTop: 30 }}>Made with ❤️ by Neel</Typography>
          <br />
        </DialogContent>
      </Dialog>
    </div>
  );
}
