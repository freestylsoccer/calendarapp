import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../../Firebase';

import { withAuthorization, AuthUserContext } from '../../Session';
import * as ROLES from '../../constants/roles';

import LoadingScreen from "../../Loading/LoadingScreen";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const INITIAL_STATE = {
    employeeId: '',
    firstName: '',
    lastName: '',
    gender: 'Female',
    company: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
    costCenter: '',
    department: '',
    jobCode: '',
    isAdmin: false,
    companyId: null,
    error: null,
    emailClass: 'form-control form-control-sm',
    passwordClass: 'form-control form-control-sm',
    password2Class: 'form-control form-control-sm',
    hireDate: new Date(),
    birthDate: new Date(),
    loading: false,
};

class CreateUser extends Component {
    constructor(props) {
        super(props);
        
        this.state = {          
          ...INITIAL_STATE
        };
    }

    static contextType = AuthUserContext;
    // Password strength validation    
    analyze(str) {        
        let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#,;:+?¡¿.$%^&*])(?=.{8,})");
        return (strongRegex.test(str));
    };
    // email validation
    emailValidation(email) {
        //Email VALIDATION        
        let lastAtPos = email.lastIndexOf('@');
        let lastDotPos = email.lastIndexOf('.');        
        return (lastAtPos < lastDotPos && lastAtPos > 0 && email.indexOf('@@') === -1 && lastDotPos > 2 && (email.length - lastDotPos) > 2);
    }
    // save employee
    onSubmit = event => {
        event.preventDefault();        
        var self = this;
        self.setState({ loading: true });
        const { employeeId,
            firstName,
            lastName,
            gender,
            company,
            email,
            passwordOne,            
            costCenter,
            department,
            jobCode,
            isAdmin,
            hireDate,
            birthDate,
            companyId } = this.state;
        var role = null;
        
        if (isAdmin) {
            role = ROLES.ADMIN;
        } else {
            role = ROLES.USER;
        }        

        const data = { employeeId,
            firstName,
            lastName,
            gender,
            company,
            email,
            password: passwordOne,            
            costCenter,
            department,
            jobCode,
            isAdmin,
            hireDate,
            birthDate,
            companyId,
            role,
            status: 'Active',}

        const createKeywords = name => {
            const arrName = [];
            let curName = '';
            name.split('').forEach(letter => {
            curName += letter;
            arrName.push(curName);
            });
            return arrName;
        }            
        
        const generateKeywords = names => {
            const [first, last, empid] = names;                  
            const keywordFullName = createKeywords(`${first} ${last}`);
            const keywordLastNameFirst = createKeywords(`${last} ${first}`);
            const KeywordEmployeeID = createKeywords(`${empid}`);                                    
            return [
            ...new Set([
                '',
                ...keywordFullName,
                ...keywordLastNameFirst,
                ...KeywordEmployeeID,                      
            ])
            ];
        }
        // str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        data.keywords = generateKeywords([data.firstName.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), data.lastName.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), data.employeeId]);
        
        data.birthDate = data.birthDate.toLocaleDateString('es-US', "dd/mm/yyyy");
        data.hireDate = data.hireDate.toLocaleDateString('es-US', "dd/mm/yyyy");
        
        data.birthDate = data.birthDate.toString();
        data.hireDate = data.hireDate.toString();        
        
        const user = this.context;        
                
        data.companyId = user.companyId;
        data.createdBy = user.fistName + ' ' + user.lastName;
        
        this.props.firebase.doCreateUsers(data)
            .then(function(resp) {
                self.setState({ loading: false }, () => {
                    console.log(resp.data.result);
                    alert('user created successful.');
                    self.setState({ ...INITIAL_STATE });
                });                                
            })
            .catch(function(error) {
                var message = error.message;
                self.setState({ loading: false }, () => {
                    console.log(message);
                    alert('an error has occured, provide this info to your provider: '+ message);
                    self.setState({ ...INITIAL_STATE });                
                });                
            });
    };
    // Password valid invalid class handler
    onChangePassword = event => {
        this.setState({ [event.target.name]: event.target.value });
        if (!this.analyze(event.target.value)){
            this.setState({ passwordClass: 'form-control is-invalid' });
        } else {
            this.setState({ passwordClass: 'form-control is-valid' });
        }
    }
    // Password valid invalid class handler
    onChangePassword2 = event => {
        this.setState({ [event.target.name]: event.target.value });

        if (event.target.value !== this.state.passwordOne){
            this.setState({ password2Class: 'form-control is-invalid' });
        } else {
            this.setState({ password2Class: 'form-control is-valid' });
        }
    }
    // Email valid invalid class handler
    onChangeEmail = event => {
        this.setState({ [event.target.name]: event.target.value });
        
        if (!this.emailValidation(event.target.value)){
            this.setState({ emailClass: 'form-control is-invalid' });
        } else {
            this.setState({ emailClass: 'form-control is-valid' });
        }
    }
    // handle changes in form values
    onChange = event => {        
        this.setState({ [event.target.name]: event.target.value });
    };
    // Handle changes in isAdmin Checkbox  
    onChangeCheckbox = event => {
    this.setState({ [event.target.name]: event.target.checked });
    };        
    
    render() {
        const { employeeId,
                firstName,
                lastName,
                gender,
                company,
                email,
                passwordOne,
                passwordTwo,
                costCenter,
                department,
                jobCode,
                isAdmin,
                hireDate,
                birthDate,
                error,
                emailClass,
                passwordClass,
                password2Class, } = this.state;        
        const isInvalid =
            passwordOne !== passwordTwo ||
            passwordOne === '' ||
            this.analyze(passwordOne) === false ||
            email === '' ||
            this.emailValidation(email) === false ||
            employeeId === '' ||
            firstName === '' ||
            lastName === '' ||
            hireDate === '' ||
            birthDate === '' ||
            costCenter === '' ||
            department === '' ||
            jobCode === '' ||
            company === '' ||
            hireDate === '';
        return (
            <>
                {this.state.loading === false ? (
                    <form className="row g-3" onSubmit={this.onSubmit}>
                        <div className="col-md-6">
                            <label htmlFor="inputEmail4" className="form-label form-label-sm">Email</label>
                            <input type="email" className={emailClass} id="inputEmail4" name="email" value={email} onChange={this.onChangeEmail}/>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="inputPassword4" className="form-label form-label-sm">Password</label>
                            <input type="password" className={passwordClass} id="inputPassword4" name="passwordOne" value={passwordOne} onChange={this.onChangePassword}/>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="inputPassword2" className="form-label form-label-sm">Repeat Password</label>
                            <input type="password" className={password2Class} id="inputPassword2" name="passwordTwo" value={passwordTwo} onChange={this.onChangePassword2}/>
                        </div>
                        <div className="col-2">
                            <label htmlFor="inputEmployeeID" className="form-label form-label-sm">Employee ID</label>
                            <input type="text" className="form-control form-control-sm" id="inputEmployeeID" placeholder="1234" name="employeeId" value={employeeId} onChange={this.onChange}/>
                        </div>
                        <div className="col-4">
                            <label htmlFor="inputFirstName" className="form-label form-label-sm">First Name</label>
                            <input type="text" className="form-control form-control-sm" id="inputFirstName" placeholder="Juan" name="firstName" value={firstName} onChange={this.onChange}/>
                        </div>
                        <div className="col-4">
                            <label htmlFor="inputLastName" className="form-label form-label-sm">Last Name</label>
                            <input type="text" className="form-control form-control-sm" id="inputLastName" placeholder="Garcia" name="lastName" value={lastName} onChange={this.onChange}/>
                        </div>
                        <div className="col-md-2">
                            <label htmlFor="inputGender" className="form-label form-label-sm">Gender</label>
                            <select id="inputGender" className="form-select form-select-sm" name="gender" value={gender} onChange={this.onChange}>                                
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="col-3">                            
                            <label htmlFor="inputHireDate" className="form-label form-label-sm">Hire Date</label>
                            <div className="row">
                                <DatePicker dateFormat="dd/MM/yyyy" className="form-control form-control-sm" selected={hireDate} onChange={date => this.setState({ hireDate: date })} required/>
                            </div>                            
                        </div>
                        <div className="col-3">
                            <label htmlFor="inputBirthDate" className="form-label form-label-sm">Birth Date</label>
                            <div className="row">
                                <DatePicker dateFormat="dd/MM/yyyy" className="form-control form-control-sm" selected={birthDate} onChange={date => this.setState({ birthDate: date })} required/>
                            </div>                            
                        </div>
                        <div className="col-3">
                            <label htmlFor="inputCompany" className="form-label form-label-sm">Company</label>
                            <input type="text" className="form-control form-control-sm" id="inputCompany" placeholder="Company S.A. de C.V." name="company" value={company} onChange={this.onChange} required/>
                        </div>
                        <div className="col-3">
                            <label htmlFor="inputCostCenter" className="form-label form-label-sm">Cost Center</label>
                            <input type="text" className="form-control form-control-sm" id="inputCostCenter" placeholder="Human Resources" name="costCenter" value={costCenter} onChange={this.onChange} required/>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="inputDepartment" className="form-label form-label-sm">Department</label>
                            <input type="text" className="form-control form-control-sm" id="inputDepartment" placeholder="Recruiting" name="department" value={department} onChange={this.onChange} required/>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="inputJob Code" className="form-label form-label-sm">Job Code</label>
                            <input type="text" className="form-control form-control-sm" id="inputJob Code" placeholder="Analyst" name="jobCode" value={jobCode} onChange={this.onChange} required/>
                        </div>
                                                
                        <div className="col-12">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="gridCheck" name="isAdmin" value={isAdmin} onChange={this.onChangeCheckbox}/>
                                <label className="form-check-label" htmlFor="gridCheck">
                                is admin
                                </label>
                            </div>
                        </div>
                        <div className="col-6">
                            <button type="submit" disabled={isInvalid} className="btn btn-primary">Save Changes</button>
                        </div>
                        {error &&
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        }
                    </form>
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
)(CreateUser);