import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../../Firebase';

import { withAuthorization } from '../../Session';
import * as ROLES from '../../constants/roles';
import LoadingScreen from "../../Loading/LoadingScreen";

class TimeAccountType extends Component {
    constructor(props) {
        super(props);
        
        this.state = {          
          loading: true,
        };
    }

    render () {
        return (
            <>
                {this.state.loading === false ? (
                    <h1>hello</h1>
                ) : (
                    <LoadingScreen />
                )}
            </>
        )
    }

}

const condition = authUser =>
  authUser && authUser.role === ROLES.ADMIN;
 
export default compose(
  withAuthorization(condition),
  withFirebase,
)(TimeAccountType);