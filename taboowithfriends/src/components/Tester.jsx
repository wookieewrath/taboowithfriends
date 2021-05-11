import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState } from "react";
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

function Tester() {
  const [testArray, setTestArray] = useState();
  const [count, setCount] = useState(1);
  const [name, setName] = useState(randomAnimal());

  useEffect(() => {
    const snapshot = db
      .collection("Tester")
      .doc("TestArrayDoc")
      .onSnapshot((doc) => {
        setTestArray(doc.data().Array);
      });
    return snapshot;
  }, []);

  async function addToArray() {
    let arrayRef = await db.collection("Tester").doc("TestArrayDoc");
    await arrayRef.update({
      Array: firebase.firestore.FieldValue.arrayUnion({
        count: count + 1,
        name: name,
      }),
    });
    setCount(count + 1);
  }
  async function removeFromArray() {
    let arrayRef2 = await db.collection("Tester").doc("TestArrayDoc");
    await arrayRef2.update({
      Array: firebase.firestore.FieldValue.arrayRemove({
        count: count,
        name: name,
      }),
    });
    setCount(count - 1);
  }

  return (
    <div>
      <div>{"Name: " + name + "  Count: " + count}</div>
      <br></br>
      <div>
        {testArray &&
          testArray.map((data) => (
            <span style={{ marginRight: 15 }}>
              {data.name}
              {"+"}
              {data.count}
            </span>
          ))}
      </div>
      <Button
        style={{
          width: 175,
          height: 50,
          backgroundColor: "#ffbf47",
          fontWeight: "bold",
          margin: 15,
        }}
        onClick={() => {
          addToArray();
        }}
      >
        Add
      </Button>
      <Button
        style={{
          width: 175,
          height: 50,
          backgroundColor: "#ffbf47",
          fontWeight: "bold",
          margin: 15,
        }}
        onClick={() => {
          removeFromArray();
        }}
      >
        Remove
      </Button>
    </div>
  );
}

export default Tester;
