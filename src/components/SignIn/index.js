import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { PasswordForgetLink } from '../PasswordForget';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../constants/routes';

const SignInPage = () => (  
  <header id="header" className="ex-2-header">
    <div className="container">
        <div className="row">
            <div className="col-lg-12">                  
                <h1>Log In</h1>                   
                <div className="form-container">    
                  <SignInForm />                    
                </div>
                <PasswordForgetLink />
            </div> 
        </div> 
    </div> 
  </header>
);


const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
  hide:'',
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);
 
    this.state = { ...INITIAL_STATE };
  }
  
  onSubmit = event => {
    const { email, password } = this.state;
 
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
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
    const { email, password, error } = this.state;
 
    const isInvalid = password === '' || email === '';    
 
    return (      
      <form data-toggle="validator" data-focus="false" onSubmit={this.onSubmit}>
          <div className="form-group">              
              <input
                className="form-control-input"
                name="email"
                value={email}
                onChange={this.onChange}
                type="email"                
                required
              />
              <label className="label-control">Email</label>
              <div className="help-block with-errors"></div>
          </div>
          <div className="form-group">              
              <input
                className="form-control-input"
                name="password"
                value={password}
                onChange={this.onChange}
                type="password"
                required
                id="lpassword"
              />
              <label className="label-control" htmlFor="lpassword">Password</label>
              <div className="help-block with-errors"></div>
          </div>
          <div className="form-group">
              <button type="submit" className="form-control-submit-button" disabled={isInvalid}>LOG IN</button>
          </div>
          <div className="form-message">
              <div className="h3 text-center hidden">
                {error && <p>{error.message}</p>}
              </div>
          </div>
      </form>
    );
  }
}
 
const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);
 
export default SignInPage;
 
export { SignInForm };