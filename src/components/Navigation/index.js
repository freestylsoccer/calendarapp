import React from 'react';
import { Link } from 'react-router-dom';

import SignOutButton from '../SignOut';
import * as ROUTES from '../constants/routes';
import { AuthUserContext } from '../Session';
import pofi from '../../images/pofi.png';

import $ from 'jquery';

/* Navbar Scripts */
// jQuery to collapse the navbar on scroll
$(window).on('scroll load', function() {
    if ($(".navbar").offset().top > 60) {
        $(".fixed-top").addClass("top-nav-collapse");
    } else {
        $(".fixed-top").removeClass("top-nav-collapse");
    }
});

/* Back To Top Button */
// create the back to top button
$('body').prepend('<a href="#header" class="back-to-top page-scroll">Back to Top</a>');
var amountScrolled = 700;
$(window).scroll(function() {
    if ($(window).scrollTop() > amountScrolled) {
        $('a.back-to-top').fadeIn('500');
    } else {
        $('a.back-to-top').fadeOut('500');
    }
});

// closes the responsive menu on menu item click
$(".navbar-nav li a").on("click", function(event) {
if (!$(this).parent().hasClass('dropdown'))
    $(".navbar-collapse").collapse('hide');
});

/* Removes Long Focus On Buttons */
$(".button, a, button").mouseup(function() {
    $(this).blur();
});

const Navigation = () => (  
  <AuthUserContext.Consumer>
    {authUser =>    
      authUser ? (
        <NavigationAuth authUser={authUser} />
      ) : (
        <NavigationNonAuth />
      )      
    }
  </AuthUserContext.Consumer>
);
 
const NavigationAuth = ({ authUser }) => (
  <>
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
        <div className="container">            
            <a className="navbar-brand logo-text page-scroll" href="/">DrPofi</a>             
            <a className="navbar-brand logo-image" href="/"><img src={pofi} alt="alternative"/></a>           
             
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-awesome fas fa-bars"></span>
                <span className="navbar-toggler-awesome fas fa-times"></span>
            </button>             

            <div className="collapse navbar-collapse" id="navbarsExampleDefault">
                <ul className="navbar-nav ml-auto">                    
                    <li className="nav-item">                        
                        <Link to={ROUTES.LANDING} className="nav-link page-scroll">LANDING</Link>
                    </li>
                    <li className="nav-item">
                      <Link to={ROUTES.HOME} className="nav-link page-scroll">HOME</Link>                        
                    </li>
                     
                    <li className="nav-item">
                      <Link to={ROUTES.ACCOUNT} className="nav-link page-scroll">ACCOUNT</Link>                        
                    </li>
                </ul>
                <span className="nav-item">
                  <SignOutButton/>
                </span>
            </div>
        </div> 
    </nav>
 </>
        
);

const NavigationNonAuth = () => (
  
  <>
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
        <div className="container">            
            <a className="navbar-brand logo-text page-scroll" href="/">DrPofi</a>             
            <a className="navbar-brand logo-image" href="index.html"><img src="images/logo.svg" alt="alternative"/></a>           
             
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-awesome fas fa-bars"></span>
                <span className="navbar-toggler-awesome fas fa-times"></span>
            </button>             

            <div className="collapse navbar-collapse" id="navbarsExampleDefault">
                <ul className="navbar-nav ml-auto">                    
                    <li className="nav-item">                        
                        <Link to={ROUTES.LANDING} className="nav-link page-scroll">LANDING</Link>
                    </li>
                </ul>
                <span className="nav-item">                    
                    <Link to={ROUTES.SIGN_IN} className="btn-outline-sm">SIGN IN</Link>
                </span>
            </div>
        </div> 
    </nav>
 </>
);

export default Navigation;