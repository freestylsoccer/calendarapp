import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
 
import App from './components/App';
import Firebase, { FirebaseContext } from './components/Firebase';

import 'bootstrap/dist/css/bootstrap.min.css';
import "jquery/dist/jquery";
import "bootstrap/dist/js/bootstrap.min.js";

import './index.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
 
ReactDOM.render(
    <FirebaseContext.Provider value={new Firebase()}>
      <App />
    </FirebaseContext.Provider>,
    document.getElementById('root'),
  );

  serviceWorker.unregister();