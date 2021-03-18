import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../Firebase';

import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';

import TimeType from './TimeOff/TimeType';
import TimeAccountType from './TimeOff/TimeAccountType';
import CreateUsers from './ManageUsers/CreateUsers';
import Users from "./ManageUsers/Users";
import WorkSchedule from "./Config/WorkSchedule";
import HolidayCalendar from "./Config/HolidayCalendar";

import { withAuthorization, AuthUserContext } from '../Session';
import * as ROLES from '../constants/roles';
import * as ROUTES from '../constants/routes';


class AdminPage extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      loading: false,
      showUsers: true,
      showHollidays: false,
      users: [],
      pickLists: [],
      hollidays: [],
    };
  } 
  static contextType = AuthUserContext
  
  componentDidMount() {
    /*
    this.props.firebase.attWorkSchedule()
    .onSnapshot(
      querySnapshot => {
        const newEntities = []          
        querySnapshot.forEach(doc => {
          const entity = doc.data()
          entity.id = doc.id
          newEntities.push(entity);          
          });
        
        let shift_start = newEntities[1].days.monday.shift_start;
        console.log(shift_start.toDate().toLocaleTimeString('es-MX'));
      },
      error => {
          console.log(error);
      }
    ) */

  }
  
  componentWillUnmount() {

  }
 
  render() {
    const { loading } = this.state;
    return (
      <div>
          <header className="header">
            <div className="header-content-2">
              <div className="container">
                <h1>Admin Center</h1>
              </div>
              {loading && <div>Loading ...</div>}
            </div>
          </header>
          <Router>
            <div className="container">
              <AdminNavigation />
              
              <Route path={ROUTES.USERS} component={Users} />
              <Route path={ROUTES.CREATE_USERS} component={CreateUsers} />
              <Route path={ROUTES.WORKSCHEDULE} component={WorkSchedule} />
              <Route path={ROUTES.HOLLIDAYCALENDAR} component={HolidayCalendar} />
              <Route path={ROUTES.TIME_TYPE} component={TimeType} />
              <Route path={ROUTES.TIME_ACCOUNT_TYPE} component={TimeAccountType} />            
            </div>
          </Router>            
      </div>            
    );
  }
}

//{ showUsers ? <UserList users={users} /> : null }                

const AdminNavigation  =  () => (
  <div className="row">   
      <ul className="nav nav-tabs" id="myTab" role="tablist">
        <li className="nav-item" role="presentation">          
          <Link to={ROUTES.ADMIN} className="nav-link" >Admin Center</Link>
        </li>
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#top" role="button" aria-expanded="false">Manage Users</a>
          <ul className="dropdown-menu">
            <li><Link to={ROUTES.USERS} className="dropdown-item" >Users</Link></li>
            <li><Link to={ROUTES.CREATE_USERS} className="dropdown-item" >User Import</Link></li>
          </ul>
        </li>
        <li className="nav-item" role="presentation">
          <Link to={ROUTES.WORKSCHEDULE} className="nav-link" >Work Schedule</Link>
        </li>
        <li>
          <Link to={ROUTES.HOLLIDAYCALENDAR} className="nav-link" >Holiday Calendar</Link>
        </li>
        <li className="nav-item" role="presentation">          
          <Link to={ROUTES.TIME_TYPE} className="nav-link" >Manage Time Type</Link>
        </li>
        <li className="nav-item" role="presentation">          
          <Link to={ROUTES.TIME_ACCOUNT_TYPE} className="nav-link" >Manage Time Accout Type</Link>
        </li>
      </ul>      
  </div>  
)

const condition = authUser =>
  authUser && authUser.role === ROLES.ADMIN;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(AdminPage);