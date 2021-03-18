import React from 'react';

function LoadingScreen() {    
  return (
    <div className="spinner-wrapper">
        <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
        </div>
    </div>
  );
}

export default LoadingScreen;