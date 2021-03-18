import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../../Firebase';

import { withAuthorization, AuthUserContext } from '../../Session';
import * as ROLES from '../../constants/roles';

import Dropzone from 'react-dropzone';
import csv from 'csv';
import utf8 from "utf8";
import LoadingScreen from "../../Loading/LoadingScreen";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

library.add(faCloudUploadAlt);

class CreateUsers extends Component {    

    constructor(props) {
        super(props);
        this.state = { success: '', error: '', files: null, loading:false, users: [] };
    }

    static contextType = AuthUserContext
    
    analyze(str) {        
        let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#,;:+?¡¿.$%^&*])(?=.{8,})");
        return (strongRegex.test(str));
    };    
    
    onDrop(files) {
                
        var self = this;
        self.setState({ files: files, loading: true });
        
        var file = files[0];
    
        const reader = new FileReader();        

        reader.onload = () => {
          csv.parse(reader.result, (err, data) => {
    
            var userList = [];            
    
            for (var i = 1; i < data.length; i++) {              
                
                const NumeroEmpleado = data[i][0];
                const Nombre = data[i][1];
                const Apellidos = data[i][2];
                const FechaIngreso = data[i][3];
                const FechaNacimiento = data[i][4];
                const Genero = data[i][5];
                const CentroCostos = data[i][6];
                const Departamento = data[i][7];
                const Puesto = data[i][8];
                const Empresa = data[i][9];
                const Email = data[i][10];
                const Contraseña = data[i][11];
                const EsAdmin = data[i][12];                                                                            

                if (Email.trim().length !== 0) {                    

                    const newUser = { "EmployeeID": NumeroEmpleado, 
                                    "Name": Nombre, 
                                    "LastName": Apellidos, 
                                    "HireDate": FechaIngreso, 
                                    "BirthDate": FechaNacimiento,
                                    "Gender": Genero,
                                    "CostCenter": CentroCostos,
                                    "Departament": Departamento,
                                    "JobCode": Puesto,
                                    "Company": Empresa,
                                    "email": Email,
                                    "password": Contraseña,
                                    "isAdmin": EsAdmin,
                                    "role": "",
                                    "roles": {},
                                    };
                    userList.push(newUser);              
                }
            };
            
            //console.log(userList);
            
            for (var j = 0; j < userList.length; j ++) {
                
                //Email VALIDATION
                let lastAtPos = userList[j].email.lastIndexOf('@');
                let lastDotPos = userList[j].email.lastIndexOf('.');
                if (!(lastAtPos < lastDotPos && lastAtPos > 0 && userList[j].email.indexOf('@@') === -1 && lastDotPos > 2 && (userList[j].email.length - lastDotPos) > 2)) {
                    alert('Email is not valid');
                    return
                }
                //Password VALIDATION
                let psValidation = this.analyze(userList[j].password);
                if (!psValidation){
                    alert('Password is not valid for the employee ' + userList[j].EmployeeID);
                    return
                }
                                
                if (userList[j].isAdmin === "si" || userList[j].isAdmin === "yes" || userList[j].isAdmin === "y" || userList[j].isAdmin === "s") {
                    // enable user creation
                    userList[j].role = "ADMIN";
                    // for front-end users
                    userList[j].roles[ROLES.ADMIN] = ROLES.ADMIN;
                } else {
                    userList[j].role = "USER";
                    userList[j].roles[ROLES.USER] = ROLES.USER;
                }                

                const data = {employeeId: userList[j].EmployeeID, 
                            firstName: utf8.decode(userList[j].Name), 
                            lastName: utf8.decode(userList[j].LastName),
                            hireDate: userList[j].HireDate, 
                            birthDate: userList[j].BirthDate,
                            gender: utf8.decode(userList[j].Gender),
                            costCenter: utf8.decode(userList[j].CostCenter),
                            department: utf8.decode(userList[j].Departament),
                            jobCode: utf8.decode(userList[j].JobCode),
                            company: utf8.decode(userList[j].Company),
                            email: utf8.decode(userList[j].email),
                            password: utf8.decode(userList[j].password),
                            role: utf8.decode(userList[j].role),
                            status: 'Active',
                }                
                
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

                data.keywords = generateKeywords([data.firstName.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), data.lastName.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), data.employeeID]);

                // User doing the call            
                const user = this.context;
                data.companyId = user.companyId;
                data.createdBy = user.fistName + ' ' + user.lastName;

                this.props.firebase.doCreateUsers(data)
                  .then(function(resp) {
                      console.log(resp.data.result);
                      self.setState({ success: resp.data.result, loading:false});
                  })
                  .catch(function(error) {
                      // var code = error.code;
                      var message = error.message;
                      console.log(message);                        
                      self.setState({ error: message, loading:false});
                  });
            }            
          });
        };
        
        reader.readAsBinaryString(file);
    }

    render() {

    const fontSize = 5;

    return (
      <>
      {this.state.loading === false ? (
      <div className="row g-3">
        <div>
          <h2>File Upload</h2>
          <p>You can upload up to 50 employees at a time.</p>          
          { this.state.error &&
            <div className="alert alert-danger" role="alert">
              { this.state.error }
            </div> }
          { this.state.success &&
            <div className="alert alert-success" role="alert">
              { this.state.success }
            </div> }
        </div>
        <div>
            <Dropzone accept=".csv" onDropAccepted={this.onDrop.bind(this)}>
                {({getRootProps, getInputProps}) => (
                    <section>                      
                      <div {...getRootProps()} className="dropzone">
                          <input {...getInputProps()} />
                          <FontAwesomeIcon icon="cloud-upload-alt" size="5x" color="#00A4FF"/>
                          <h2>Upload or drop your <font size={fontSize} color="#00A4FF">CSV</font><br /> file here.</h2>
                          
                      </div>
                    </section>
                )}
            </Dropzone>
          <br /><br /><br />
        </div>        
      </div>
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
)(CreateUsers);