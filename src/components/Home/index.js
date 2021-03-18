import React, {Component} from 'react';
 
import { AuthUserContext, withAuthorization } from '../Session';

import EventsCalendar from '../Agenda/agenda';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faClock, faSignInAlt, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSignInAlt, faSignOutAlt);
 
class HomePage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }    
  };

  static contextType = AuthUserContext;

  //This happens when the component mount and the setInterval function get called with a call back function updateClock()
  componentDidMount() {
    // 
  };

  //This section clears setInterval by calling intervalID so as to optimise memory
  componentWillUnmount(){
    //
  };

  
  
  render() {
    return(
      <div>
        <header className="header">
          <div className="header-content-2">
            <div className="container">
              <h1>Home</h1>
            </div>
          </div>
        </header>
        <div className="container-fluid">         
           <EventsCalendar />                   
        </div>
      </div>
    );
  }
}
 
const condition = authUser => !!authUser;
 
export default withAuthorization(condition)(HomePage);