import "./App.css";
import HostView from "./components/HostView";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route path="/" exact component={LandingPage} />
            <Route path="/host/:roomID/:playerID" exact component={HostView} />
            <Route
              path="/play/:roomID/:playerID"
              exact
              component={PlayerView}
            />
            <Route path="/game" exact component={GameCard} />
          </Switch>
        </header>
      </div>
    </Router>
  );
}

export default App;
