import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../../Firebase';

import { withAuthorization, AuthUserContext } from '../../Session';
import * as ROLES from '../../constants/roles';

import LoadingScreen from "../../Loading/LoadingScreen";
import Modal from "../../Modal/Modal";
import CreateUser from "./CreateUser";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser, faSearch, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-regular-svg-icons";

library.add(faEdit, faUser, faSearch, faInfoCircle);
const INITIAL_STATE = {
  loading: false,
  data: [],
  users: [],
  user: { 
    birthDateOK: new Date(),
    company: "",
    companyId: "",
    costCenter: "",
    createdBy: "",
    department: "",
    email: "",
    employeeId: "",
    firstName: "",
    gender: "",
    hireDate: "",
    hireDateOK: new Date(),
    id: "",
    isAdmin: false,
    jobCode: "",
    lastModifiedBy: "",
    lastName: "",
    role: "",
    status: "" 
  },
  offset: 0,      
  perPage: 3,        
  currentPage: 0,
  search: '',
  lastVisible: '',
  searchChanged: false,
  userEdit: {},
}

class Users extends Component {
    constructor(props) {
      super(props)
            
      this.state = {
        ...INITIAL_STATE, 
        error: null,
        isDisabled: false,
        success: null,
        show: false,
        showDetails: false,
        showEditForm: false };  
      
      this.handlePageClick = this
        .handlePageClick
        .bind(this);
      
      this.showModal = this.showModal.bind(this);
      this.hideModal = this.hideModal.bind(this);            
    } 
    static contextType = AuthUserContext

    showModal = async () => {
      this.setState({ show: true, isDisabled:false, user: {}, showDetails: false });
    };
  
    hideModal = () => {
      this.setState({ show: false, error: null, success: null });
    };
    
    handlePageClick = (e) => {
      const selectedPage = e.selected;
      const offset = selectedPage * this.state.perPage;      
      this.setState({        
        currentPage: selectedPage,
        offset: offset,
        searchChanged: false,
      }, () => {
          this.getUsers()
      });

    };

    async getUsers () {
      var self = this;    
      var last = '';
      
      if (self.state.lastVisible !== undefined) {
        last = self.state.lastVisible;
      }
      if (self.state.searchChanged) last = '';
      
      await this.props.firebase.users()                
        .orderBy('lastName')
        .where('keywords', 'array-contains', self.state.search.toLocaleLowerCase())
        .limit(self.state.perPage)
        .startAfter(last)
        .get()
        .then((documentSnapshots) => {
          var lastEntry = documentSnapshots && documentSnapshots.docs[documentSnapshots.docs.length-1];
          documentSnapshots.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            const entity = doc.data()
            entity.uid = doc.id            
            // self.state.users.push(entity);            
            self.setState({                
              users: self.state.users.concat([entity])
            });
          });
          this.setState({                
            loading: false,
            lastVisible: lastEntry,
          });

        })
        /*
        .onSnapshot(
          querySnapshot => {
            const newEntities = []
              
            querySnapshot.forEach(doc => {
              const entity = doc.data()
              entity.id = doc.id
              newEntities.push(entity);
              // self.state.users.push(entity);
              self.setState({                
                users: self.state.users.concat([entity])
              });
            });
            
            var lastEntry = querySnapshot && querySnapshot.docs[querySnapshot.docs.length-1];
            
            console.log(lastEntry)
            console.log(self.state.users);
            
            // const usersList = Object.keys(newEntities).map(key => ({
            //   ...newEntities[key],
            //   uid: key,
            // }));
            
            this.setState({                
              loading: false,
              lastVisible: lastEntry,
            });
          },
          error => {
              console.log(error);
          }
        )
        */
    }

    componentDidMount() {      
      this.getUsers();      
    }
    
    componentWillUnmount() {
      // this.props.firebase.users();      
    }
    
    searchSpace = (event) => {
      let keyword = event.target.value;
      console.log(keyword.length)
      if (keyword.length >= 2 || keyword === "") {        
        this.setState({search:keyword, users:[], searchChanged: true }, () => {
          this.getUsers();
        })
      }
    }

    onShowDetails = (id) => {
      let item = JSON.parse(JSON.stringify(this.state.users.find(x => x.uid === id)));

      if (item.hireDateOK.getMonth === undefined) {
        if (item.hireDateOK !== null && item.birthDateOK != null) {
          let startMilliseconds = (item.hireDateOK.seconds * 1000) + (item.hireDateOK.nanoseconds / 1000000);
          let endMilliseconds = (item.birthDateOK.seconds * 1000) + (item.birthDateOK.nanoseconds / 1000000);
          
          item.hireDateOK = new Date(startMilliseconds);
          item.birthDateOK = new Date(endMilliseconds);
        }
      }      

      this.setState({user: item, show: true, showDetails: true, isDisabled:true });

    }

    onEditClick = async (id) => {      
      let item = JSON.parse(JSON.stringify(this.state.users.find(x => x.uid === id)));

      if (item.hireDateOK.getMonth === undefined) {
        if (item.hireDateOK !== null && item.birthDateOK != null) {
          let startMilliseconds = (item.hireDateOK.seconds * 1000) + (item.hireDateOK.nanoseconds / 1000000);
          let endMilliseconds = (item.birthDateOK.seconds * 1000) + (item.birthDateOK.nanoseconds / 1000000);
          
          item.hireDateOK = new Date(startMilliseconds);
          item.birthDateOK = new Date(endMilliseconds);
        }
      }
      
      this.setState({user: item, userEdit: item, show: true, showEditForm: true, isDisabled: false });    
    }

    onChangeEdit = event => {
      event.preventDefault()
      
      this.setState({
          ...this.state,
          user: { ...this.state.user, [event.target.name]: event.target.value },
      });        
    };

    /*
    // handle change of select workSchedule
    onChangeSelect = event => {
      this.setState({ workSchedule: this.state.workSchedules[event.target.value] }, () => {
        if (this.state.user.workSchedule.value !== this.state.workSchedules[event.target.value].value) {
          this.setState({ workScheduleChanged: true });
        } else {
          this.setState({ workScheduleChanged: false });
        }
      });
    }
    */

    onEditDates = (date, name) => {
      this.setState({
        ...this.state,
        user: { ...this.state.user, [name]: date },
      });
    }

    onSubmitEdit = event => {
      event.preventDefault();

      var self = this;
      const {user, userEdit} = this.state;
      self.setState({ loading: true });

      if (JSON.stringify(user) === JSON.stringify(userEdit)) {
          this.setState({error: 'There are no changes to save.', loading:false})
          return
      }
      let changeUserRole = false;
      let changeUserStatus = false;
      
      if (user.status !== userEdit.status) {        
        changeUserStatus = true;
      }

      if (user.isAdmin !== userEdit.isAdmin) {
        changeUserRole = true;
      }

      const data = user;      
      if (data.isAdmin) {
          data.role = ROLES.ADMIN;
      } else {
          data.role = ROLES.USER;
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
      // str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      data.keywords = generateKeywords([data.firstName.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), data.lastName.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), data.employeeId]);
      
      data.birthDate = data.birthDateOK.toLocaleDateString('es-US', "dd/mm/yyyy");
      data.hireDate = data.hireDateOK.toLocaleDateString('es-US', "dd/mm/yyyy");
      
      data.birthDate = data.birthDate.toString();
      data.hireDate = data.hireDate.toString();
      
      const userL = this.context;
      
      let timestamp = this.props.firebase.getTimestamp();
      data.companyId = userL.companyId;
      data.lastModifiedBy = userL.firstName + ' ' + userL.lastName;
      data.lastDateModifiedOn = timestamp;
            
      console.log(data);      
      
      this.props.firebase.users()
        .doc(data.uid)
        .update(data)
        .then( () => {
          if(changeUserStatus) {
            self.props.firebase.doDeactivateUser({
              uid: data.uid,
              email: data.email,
              name: data.firstName + ' ' + data.lastName,
              status: data.status,
            })
            .then(function(resp) {
              console.log(resp.data.result);
            });
          }
          if(changeUserRole) {
            self.props.firebase.doChangeClaim({
              uid:data.uid,
              email:data.email,
              name:data.firstName + ' ' + data.lastName,
              role: data.role
            })
            .then(function(resp) {
              console.log(resp.data.result);
            });
          }
          self.setState({ ...INITIAL_STATE, success: 'Changes saved successfull.', showEditForm: false }, () => {
            this.getUsers();
          });
        })
        .catch(function(error) {
          var message = error;
          console.log(message);
          self.setState({ error: 'An error has occured, provide this info to your provider: '+ message, loading: false });
        });      
    }

    onChangeCheckbox = event => {      
      this.setState({
          ...this.state,
          user: { ...this.state.user, [event.target.name]: event.target.checked },
      });      
    };
    
    disableFields = () => {      
      this.setState({ isDisabled: true, showEditForm: false })
    }

    // get Work Schedules
    getWorkSchedules () {
      const user = this.context;
      this.props.firebase.attWorkScheduleSearch()
          .orderBy('name')
          .limit(5)
          .where("companyId", "==", user.companyId)
          .where("status", "==", "Active")
          .get()
          .then((querySnapshot) => {
              let recommendedTags = []
              querySnapshot.forEach((doc) => {
                  // doc.data() is never undefined for query doc snapshots                  
                  const tag = {
                      value: doc.id,
                      label: doc.data().name
                  }
                  recommendedTags.push(tag)
              });
              this.setState({ workSchedules: recommendedTags });
          })
          .catch((error) => {                        
              console.log("Error getting documents: ", error);                
          });
    }
   
    render() {        
      
      return (
      <div className="container-fluid">
        {this.state.loading === false ? (          
          <div>            
            {this.state.showDetails ? (
              <Modal show={this.state.show} handleClose={this.hideModal} title={'Employee Details'}>
                <User user={this.state.user} isDisabled={this.state.isDisabled}
                  onShowDetails={this.onShowDetails}
                />
              </Modal>
            ) : (
              <Modal show={this.state.show} handleClose={this.hideModal} title={'Add New Employee'}>
                <CreateUser />
              </Modal>
            )}            
            { !this.state.showEditForm ? (
            <>
            <h2>Users</h2>
            <div className="row justify-content-end">
            { this.state.success &&
            <div className="alert alert-success" role="alert">
                { this.state.success }
            </div> 
            }
              <div className="col-3">
                <form className="row g-3">
                  <div className="col-7 offset-md-5">
                    <button type="button" className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={this.showModal}> <FontAwesomeIcon icon="user" /> Crear Nuevo Usuario</button>
                  </div>
                  <div className="row g-3">                    
                    <div className="col-10 offset-md-1">
                      <input type="text" className="form-control form-control-sm" aria-describedby="searchHelpInline" placeholder="Serach by EmployeeID or Name." onChange={(e)=>this.searchSpace(e)} />                    
                    </div>
                    <div className="col-1">
                      <FontAwesomeIcon icon="search" />
                    </div>
                  </div>                  
                </form>
              </div>
            </div>
            <div className="table-responsive">                
              <UserList users={this.state.users} onEditClick={this.onEditClick} onShowDetails={this.onShowDetails} />              
            </div>
            <div className="row justify-content-center">
              <div className="col-2">
              { this.state.lastVisible !== undefined ? (
                <button type="button" className="btn btn-light btn-sm" onClick={(e)=> this.handlePageClick(e)} >Show more results</button>
              ) : (
                <figure className="text-center">
                  <blockquote className="blockquote">
                    <p>No more data to display.</p>                    
                  </blockquote>
                </figure>
              )}
              </div>  
            </div>
            </>
            ) : (
            <div>
              <h2>Edit User</h2>
              <User user={this.state.user} isDisabled={this.state.isDisabled}
                disableFields={this.disableFields}
                onChangeEdit={this.onChangeEdit}
                onChangeSelect={this.onChangeSelect}
                onChangeCheckbox={this.onChangeCheckbox}
                onEditDates={this.onEditDates}
                onShowDetails={this.onShowDetails}
                error={this.state.error}
                success={this.state.success} onSubmitEdit={this.onSubmitEdit}
              />
            </div>
            )
            }
          </div>
          
        ) : (
          <LoadingScreen />
        )}
        </div>
      );
    }
}

class User extends Component {
  render () {
    
    const isInvalid =      
      this.props.user.email === '' ||      
      this.props.user.employeeId === '' ||
      this.props.user.firstName === '' ||
      this.props.user.lastName === '' ||
      this.props.user.hireDate === '' ||
      this.props.user.birthDate === '' ||
      this.props.user.costCenter === '' ||
      this.props.user.department === '' ||
      this.props.user.jobCode === '' ||
      this.props.user.company === '' ||
      this.props.user.hireDate === '';        

    return (
      <form className="row g-3" onSubmit={this.props.onSubmitEdit}>
        <div className="col-md-6">
            <label htmlFor="inputEmail4" className="form-label form-label-sm">Email</label>
            <input type="email" className="form-control form-control-sm" id="inputEmail4" name="email" value={this.props.user.email} onChange={this.props.onChangeEdit} disabled required/>
        </div>
        <div className="col-md-3"></div>
        <div className="col-md-3"></div>
        <div className="col-2">
            <label htmlFor="inputEmployeeID" className="form-label form-label-sm">Employee ID</label>
            <input type="text" className="form-control form-control-sm" id="inputEmployeeID" placeholder="1234" name="employeeId" value={this.props.user.employeeId} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required/>
        </div>
        <div className="col-4">
            <label htmlFor="inputFirstName" className="form-label form-label-sm">First Name</label>
            <input type="text" className="form-control form-control-sm" id="inputFirstName" placeholder="Juan" name="firstName" value={this.props.user.firstName} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required/>
        </div>
        <div className="col-4">
            <label htmlFor="inputLastName" className="form-label form-label-sm">Last Name</label>
            <input type="text" className="form-control form-control-sm" id="inputLastName" placeholder="Garcia" name="lastName" value={this.props.user.lastName} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required/>
        </div>
        <div className="col-md-2">
            <label htmlFor="inputGender" className="form-label form-label-sm">Gender</label>
            <select id="inputGender" className="form-select form-select-sm" name="gender" value={this.props.user.gender} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required >                                
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <div className="col-3">                            
            <label htmlFor="inputHireDate" className="form-label form-label-sm">Hire Date</label>
            <div className="row">
                <DatePicker dateFormat="dd/MM/yyyy" className="form-control form-control-sm" selected={this.props.user.hireDateOK} name="hireDateOK" onChange={date => this.props.onEditDates(date, "hireDateOK")} disabled={this.props.isDisabled} required />
            </div>                            
        </div>
        <div className="col-3">
            <label htmlFor="inputBirthDate" className="form-label form-label-sm">Birth Date</label>
            <div className="row">
                <DatePicker dateFormat="dd/MM/yyyy" className="form-control form-control-sm" selected={this.props.user.birthDateOK} name="birthDateOK" onChange={date => this.props.onEditDates(date, "birthDateOK")} disabled={this.props.isDisabled} required />
            </div>                            
        </div>
        <div className="col-3">
            <label htmlFor="inputCompany" className="form-label form-label-sm">Company</label>
            <input type="text" className="form-control form-control-sm" id="inputCompany" placeholder="Company S.A. de C.V." name="company" value={this.props.user.company} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required />
        </div>
        <div className="col-3">
            <label htmlFor="inputCostCenter" className="form-label form-label-sm">Cost Center</label>
            <input type="text" className="form-control form-control-sm" id="inputCostCenter" placeholder="Human Resources" name="costCenter" value={this.props.user.costCenter} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required />
        </div>
        <div className="col-md-4">
            <label htmlFor="inputDepartment" className="form-label form-label-sm">Department</label>
            <input type="text" className="form-control form-control-sm" id="inputDepartment" placeholder="Recruiting" name="department" value={this.props.user.department} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required />
        </div>
        <div className="col-md-4">
            <label htmlFor="inputJob Code" className="form-label form-label-sm">Job Code</label>
            <input type="text" className="form-control form-control-sm" id="inputJob Code" placeholder="Analyst" name="jobCode" value={this.props.user.jobCode} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required />
        </div>
        <div className="col-md-2">
            <label htmlFor="inputStatus" className="form-label form-label-sm">Status</label>
            <select id="inputStatus" className="form-select form-select-sm" name="status" value={this.props.user.status} onChange={this.props.onChangeEdit} disabled={this.props.isDisabled} required >                                
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
            </select>
        </div>        
        <div className="col-12">
            <div className="form-check">
                <input className="form-check-input" type="checkbox" id="gridCheck" name="isAdmin" defaultChecked={this.props.user.isAdmin} value={this.props.user.isAdmin} onChange={this.props.onChangeCheckbox} disabled={this.props.isDisabled}/>
                <label className="form-check-label" htmlFor="gridCheck">
                is admin
                </label>
            </div>
        </div>
        { !this.props.isDisabled &&        
        <div className="buttons">
            <button type="submit" disabled={isInvalid} className="btn btn-primary btn-sm">Save Changes</button>                                        
            <button type="button" className="btn btn-danger btn-sm" onClick={this.props.disableFields} >Cancel</button>
        </div>
        }
        
        {this.props.error &&
            <div className="alert alert-danger" role="alert">
                {this.props.error}
            </div>
        }
      </form>
    )
  }
}

class UserList extends Component {
  render () {
    return (
      <table className="table table-striped table-hover table-sm">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Details</th>
            <th scope="col">Edit</th>
          </tr>
        </thead>
        <tbody>
        {this.props.users.map(user => (
          <tr key={'user_'+user.uid}>
            <th scope="row">{user.employeeId}</th>
            <td>{user.firstName}</td>
            <td>{user.lastName}</td>
            <td>{user.email}</td>        
            <td>{user.role}</td>
            <td>{user.status}</td>
            <td>
              <button type="button" className="btn btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(event) => this.props.onShowDetails(user.uid)}>            
                <FontAwesomeIcon icon="info-circle" />
              </button>
            </td>
            <td>
              <button type="button" className="btn btn btn-light btn-sm" onClick={(event) => this.props.onEditClick(user.uid)}>
                <FontAwesomeIcon icon={["far", "edit"]} />            
              </button>          
            </td>        
          </tr>
        ))}
        </tbody>
      </table>
    )
  }
}

const condition = authUser =>
  authUser && authUser.role === ROLES.ADMIN;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(Users);