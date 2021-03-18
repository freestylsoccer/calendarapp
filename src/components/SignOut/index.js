import React from 'react';
import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (
  <button type="button" className="btn-outline-sm" onClick={firebase.doSignOut}>
    SIGN OUT
  </button>
);
 
export default withFirebase(SignOutButton);