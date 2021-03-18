import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../constants/routes';
import * as ROLES from '../constants/roles';
 
const SignUpPage = () => (
  <div>
    <h1>SignUp</h1>
    <SignUpForm />
  </div>
);

const INITIAL_STATE = {
    employeeId: '',
    firsName: '',
    lastName: '',
    motherLastName: '',
    companyId: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    isAdmin: false,
    error: null,
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }
 
  onSubmit = event => {
    const { employeeId,
            firstName,
            lastName,
            motherLastName,
            companyId,
            email,
            passwordOne,      
            isAdmin } = this.state;
    var role = null;
 
    if (isAdmin) {
      role = ROLES.ADMIN;
    }
     //Email VALIDATION        
    let lastAtPos = email.lastIndexOf('@');
    let lastDotPos = email.lastIndexOf('.');

    if (!(lastAtPos < lastDotPos && lastAtPos > 0 && email.indexOf('@@') === -1 && lastDotPos > 2 && (email.length - lastDotPos) > 2)) {
      alert('Email is not valid');
      return
    }

    this.props.firebase      
     .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then((response) => {
          // create a user in Firestore
          const uid = response.user.uid;
          const status = true;
          const timestamp = this.props.firebase.getTimestamp();                            
          
          const userData = {
              id: uid,              
              employeeId,
              firstName,
              lastName,
              motherLastName,
              companyId,
              email,
              status,
              role,              
              timestamp,
          };
          //const usersRef = firebase.firestore().collection('users')
          this.props.firebase.users()
              .doc(uid)
              .set(userData)
              .then(() => {     
                this.setState({ ...INITIAL_STATE });
                this.props.history.push(ROUTES.HOME);           
              })
              .catch((error) => {
                this.setState({ error });
              });
      })
      .catch((error) => {
        this.setState({ error });
      })
 
    event.preventDefault();
  };
 
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  
  onChangeCheckbox = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  render() {
    const {
        employeeId,
        firstName,
        lastName,
        motherLastName,
        companyId,
        email,
        passwordOne,
        passwordTwo,
        isAdmin,
        error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      employeeId === '' ||
      firstName === '' ||
      lastName === '' ||
      motherLastName === '' ||
      companyId === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="employeeId"
          value={employeeId}
          onChange={this.onChange}
          type="text"
          placeholder="Employee ID"
        />
        <input
          name="firstName"
          value={firstName}
          onChange={this.onChange}
          type="text"
          placeholder="First Name"
        />
        <input
          name="lastName"
          value={lastName}
          onChange={this.onChange}
          type="text"
          placeholder="Last Name"
        />
        <input
          name="motherLastName"
          value={motherLastName}
          onChange={this.onChange}
          type="text"
          placeholder="Mothers Last Name"
        />
        <input
          name="companyId"
          value={companyId}
          onChange={this.onChange}
          type="text"
          placeholder="Company ID"
        />
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password"
        />
        <label>
          Admin:
          <input
            name="isAdmin"
            type="checkbox"
            checked={isAdmin}
            onChange={this.onChangeCheckbox}
          />
        </label>
        <button disabled={isInvalid} type="submit">
          Sign Up
        </button>
 
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}
 
const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(
    withRouter,
    withFirebase,
  )(SignUpFormBase);

export default SignUpPage;
 
export { SignUpForm, SignUpLink };