import './App.css';
import HostView from './components/HostView';
import LandingPage from "./components/LandingPage"
import PlayerView from './components/PlayerView';
import GameCard from './components/GameCard'
import { BrowserRouter as Router, Switch, Route} from "react-router-dom"

function App() {
  return (
    <Router>
    <div className="App">
      <header className="App-header">
        <Switch>
          <Route path ="/" exact component={LandingPage}/>
          <Route path ="/host/:roomID/:playerID" exact component={HostView}/>
          <Route path ="/play/:roomID/:playerID" exact component={PlayerView}/>
          <Route path ="/game" exact component={GameCard}/>
        </Switch>
      </header>
    </div>
    </Router>
  );
}

export default App;