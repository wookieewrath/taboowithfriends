import "./App.css";
import HostView from "./components/HostView";
import LandingPage from "./components/LandingPage";
import PlayerView from "./components/PlayerView";
import GameView from "./components/GameView";
import Timer from "./components/Timer";
import Tester from "./components/Tester";
import OneDay from "./components/OneDay";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route path="/" exact component={LandingPage} />
            <Route path="/host" exact component={HostView} />
            <Route path="/play" exact component={PlayerView} />
            <Route path="/game" exact component={GameView} />
            <Route path="/timer" exact component={Timer} />
            <Route path="/tester" exact component={Tester} />
          </Switch>
        </header>
      </div>
    </Router>
  );
}

export default App;
