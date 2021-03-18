import React from 'react';
 
import { AuthUserContext, withAuthorization } from '../Session';
import { PasswordForgetForm } from '../PasswordForget';
import PasswordChangeForm from '../PasswordChange';
 
const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
          <header className="header">
            <div className="header-content-2">
              <div className="container">
                <h1>Welcome: {authUser.firstName} {authUser.lastName}</h1>
              </div>
            </div>
          </header>
          <div className="container">
            <div className="row g-3">
              <div className="col-6">
                <PasswordChangeForm />
              </div>
              <div className="col-6">
                <PasswordForgetForm />
              </div>                            
            </div>
          </div>
      </div>
    )}
  </AuthUserContext.Consumer>
);
 
const condition = authUser => !!authUser;
 
export default withAuthorization(condition)(AccountPage);