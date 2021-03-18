import React from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons"; 
import { faFolderOpen, faClock, faChartBar, faCheck, faTimes, faSquare, faMapMarkerAlt, faEnvelope, faGlobe, faCircle } from "@fortawesome/free-solid-svg-icons";

library.add( faFolderOpen, faClock, faChartBar, faCheck, faTimes, faSquare, faMapMarkerAlt, faEnvelope, faGlobe, faCircle, fab);

export default function LandingPage() {    
    return (        
        <div>
            <header id="header" className="header">
                <div className="header-content">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6 col-xl-5">
                                <div className="text-container">
                                    <h1>Dr Pofi App Landing Page</h1>
                                    <p className="p-large">Use POFI to automate improve your schedule</p>
                                </div>
                            </div>
                            <div className="col-lg-6 col-xl-7">
                                <div className="image-container">
                                    <div className="img-wrapper">
                                        <img className="img-fluid" alt="alternative"></img>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1>
            <h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1>
            <h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1>
            <h1>Hola Dr Pofi</h1><h1>Hola Dr Pofi</h1>
        </div>
    );
}