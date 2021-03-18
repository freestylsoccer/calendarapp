import React, { Component } from 'react';
import { withFirebase } from '../Firebase';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSquare } from "@fortawesome/free-solid-svg-icons";

library.add(faSquare);
 
const INITIAL_STATE = {
  passwordOne: '',
  passwordTwo: '',
  error: null,
};
 
class PasswordChangeForm extends Component {
  constructor(props) {
    super(props);
 
    this.state = { ...INITIAL_STATE };
  }
 
  onSubmit = event => {
    const { passwordOne } = this.state;
 
    this.props.firebase
      .doPasswordUpdate(passwordOne)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        this.setState({ error });
      });
 
    event.preventDefault();
  };
 
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
 
  render() {
    const { passwordOne, passwordTwo, error } = this.state;
 
    const isInvalid =
      passwordOne !== passwordTwo || passwordOne === '';
 
    return (
      <div className="row g-3">
        <div className="col-12">
          <div className="col-12">
            <h3>Change Password</h3>
            <p>In order to protect your account, make sure your password:</p>
            <ul className="list-unstyled li-space-lg">
                <li className="media">
                  <p><FontAwesomeIcon icon="square" color="#5f4dee" size="xs"/> The string must contain at least 1 lowercase alphabetical character.</p> 
                </li>
                <li className="media">                    
                  <p><FontAwesomeIcon icon="square" color="#5f4dee" size="xs" /> The string must contain at least 1 uppercase alphabetical character.</p>
                </li>
                <li className="media">                                       
                  <p><FontAwesomeIcon icon="square" color="#5f4dee" size="xs" /> The string must contain at least 1 numeric character [!@#$%^&*].</p>
                </li>
                <li className="media">                                        
                  <p><FontAwesomeIcon icon="square" color="#5f4dee" size="xs" /> The string must be eight characters or longer.</p>
                </li>
            </ul>            
          </div>                  
          
          <form className="col-6" onSubmit={this.onSubmit}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                className="form-control"
                name="passwordOne"
                value={passwordOne}
                onChange={this.onChange}
                type="password"
              />
              <label className="form-label">Confirm New Password</label>
              <input
              className="form-control"
                name="passwordTwo"
                value={passwordTwo}
                onChange={this.onChange}
                type="password"
              />    
            </div>        
            <button disabled={isInvalid} type="submit" className="btn btn-primary mb-2">Change My Password</button>
            {error && <p>{error.message}</p>}
          </form>
        </div>
      </div>
    );
  }
}
 
export default withFirebase(PasswordChangeForm);