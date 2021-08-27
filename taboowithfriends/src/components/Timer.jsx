import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import "firebase/firestore";
import React, { useState } from "react";
import { db } from "../constants";

function Timer() {
  const [buttonFourData, setButtonFourData] = useState("");
  const [buttonFiveData, setButtonFiveData] = useState("");

  function buttonOne() {
    db.collection("Demo").doc("DemoDocument").set({ name: "Foo" });
  }
  function buttonTwo() {
    db.collection("Demo").add({ name: "Foo2" });
  }
  function buttonThree() {
    db.collection("Demo").doc("DemoDocument").update({ name: "UpdatedName" });
  }
  async function buttonFour() {
    const doc = await db.collection("Demo").doc("DemoDocument").get();
    console.log(doc.data());
    setButtonFourData(doc.data().name);
  }
  async function buttonFive() {
    db.collection("Demo")
      .doc("DemoDocument")
      .onSnapshot((doc) => {
        console.log("Current data: ", doc.data());
        setButtonFiveData(doc.data().name);
      });
  }

  return (
    <div>
      <Button
        style={{
          backgroundColor: "#ffbf47",
          fontWeight: "bold",
          margin: 15,
        }}
        onClick={buttonOne}
      >
        Create a Collection, Document, and Field
      </Button>
      <Typography>
        {`db.collection("Demo").doc("DemoDocument").set({ name: "Foo" });`}
      </Typography>
      <Button
        style={{
          backgroundColor: "#ffbf47",
          fontWeight: "bold",
          margin: 15,
        }}
        onClick={buttonTwo}
      >
        Create a Collection, Document, and Field (auto ID)
      </Button>
      <Typography>{`db.collection("Demo").add({ name: "Foo2" });`}</Typography>
      <Button
        style={{
          backgroundColor: "#ffbf47",
          fontWeight: "bold",
          margin: 15,
        }}
        onClick={buttonThree}
      >
        Updated Document
      </Button>
      <Typography>{`db.collection("Demo").doc("DemoDocument").update({ name: "UpdatedName" });`}</Typography>
      <Button
        style={{
          backgroundColor: "#ffbf47",
          fontWeight: "bold",
          margin: 15,
        }}
        onClick={buttonFour}
      >
        Get Data
      </Button>
      <Typography>
        {`doc = db.collection("Demo").doc("DemoDocument").get()`}
      </Typography>
      <Typography>{`doc.data()`}</Typography>
      <Typography>{buttonFourData}</Typography>

      <Button
        style={{
          backgroundColor: "#ffbf47",
          fontWeight: "bold",
          margin: 15,
        }}
        onClick={buttonFive}
      >
        Start Listener
      </Button>
      <Typography>
        {` db.collection("Demo")
      .doc("DemoDocument")
      .onSnapshot((doc) => {
        setButtonFiveData(doc.data().name);
      });`}
        {buttonFiveData}
      </Typography>
      <Typography>{buttonFiveData}</Typography>
    </div>
  );
}

export default Timer;
