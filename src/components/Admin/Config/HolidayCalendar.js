import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../../Firebase';

import { withAuthorization, AuthUserContext } from '../../Session';
import * as ROLES from '../../constants/roles';

import LoadingScreen from '../../Loading/LoadingScreen';
import Search from '../../Search/Search';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";

library.add(faPlusCircle, faTrash);

const INITIAL_STATE = {
    success: '',
    error: '',
    name: '',
    details: {
        holidays: [
            {
                date: new Date(),
                class: 'Full',
                holiday: ''
            }
        ]
    },
    holidayCalendar: {},
    isDisabled: true,
    loading: false,    
    showEditForm: false,
    showCreateForm: false,

}
class HolidayCalendar extends Component {
    constructor(props) {
      super(props);
      
      this.state = {
        ...INITIAL_STATE,
      };      
    } 
    static contextType = AuthUserContext;
    
    // on holiday calendar creation
    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };
    
    // on holiday calendar creation details
    onChangeDetails = (index, event, i) => {                
        let clone = {...this.state.details};        
        let item = {...clone.holidays[index]}
        if (i === 0) {
            item.date = event;
            item.date.setHours(0, 0, 0, 0);
        } else if (i === 1) {
            item.class = event.target.value;
        } else {
            item.holiday = event.target.value;
        }
        
        clone.holidays[index] = item;
        this.setState({ details: clone });
    };

    // on holiday calendar edit
    onChangeDetailsEdit = (index, event, i) => {                
        let clone = {...this.state.holidayCalendar.details};
        let item = {...clone.holidays[index]}
        if (i === 0) {
            item.date = event;
        } else if (i === 1) {
            item.class = event.target.value;
        } else {
            item.holiday = event.target.value;
        }
        
        clone.holidays[index] = item;
        this.setState({ ...this.state,
            holidayCalendar: {...this.state.holidayCalendar, details: clone} });
    };
    
    // on holiday calendar edit
    onChangeEdit = event => {
        event.preventDefault();
        this.setState({
            ...this.state,
            holidayCalendar: { ...this.state.holidayCalendar, [event.target.name]: event.target.value },
        });        
    };
    
    // on holiday calendar creation
    onAddItem = () => {        
        let clone = {...this.state.details};        
        let item = {
                date: new Date(),
                class: 'Full',
                holiday: ''
                }
        
        clone.holidays.push(item);
        this.setState({ details: clone });
    }

    // on holiday calendar creation
    onRemoveItem = (index, e) => {
        let clone = {...this.state.details};        
        clone.holidays.pop(index);        
        this.setState({ details: clone });
    }
    
    // on holiday calendar edit
    onAddItemEdit = () => {        
        let clone = {...this.state.holidayCalendar.details};
        
        let item = {
                date: new Date(),
                class: 'Full',
                holiday: ''
                }
        
        clone.holidays.push(item);
        this.setState({
            ...this.state,
            holidayCalendar: { ...this.state.holidayCalendar, details: clone },
        });
    }

    // on holiday calendar edit
    onRemoveItemEdit = (index, e) => {
        let clone = {...this.state.holidayCalendar.details};
        clone.holidays.pop(index);        
        this.setState({
            ...this.state,
            holidayCalendar: { ...this.state.holidayCalendar, details: clone },
        });
    }    

    // on holiday calendar creation
    onSubmit = event => {
        event.preventDefault();
        var self = this;
        self.setState({ loading: true });
        const { name, details } = this.state;

        const data = { name,
                    details,
                    status: 'Active',
        }
                
        const dates = [];
        for (var i = 0; i < data.details.holidays.length; i++) {            
            if (data.details.holidays[i].date === undefined || data.details.holidays[i].date === '' || data.details.holidays[i].date ===  null ) {
                self.setState({ error: 'There is an error with the dete of holiday.', loading:false });
                return
            }
            dates.push(data.details.holidays[i].date);
        }
        // filter duplicated date values
        let datesResult = this.useFilter(dates);            
        if (data.details.holidays.length !== datesResult.length) {
            self.setState({ error: 'There are duplicated values in the holidays dates.', loading:false });
            return
        }

        const timestamp = this.props.firebase.getTimestamp();
        const user = this.context;
        data.companyId = user.companyId;
        data.createdBy = user.fistName + ' ' + user.lastName;
        data.createdOn = timestamp;

        this.props.firebase.attHolidayCalendar()
            .add(data)
            .then((resp) => {
                
                let docId = resp.id;
                let companyId = data.companyId;
                let name = data.name;
                let status = data.status;

                this.props.firebase.attHolidayCalendarSearch()
                    .doc(docId)
                    .set({
                        name,
                        companyId,
                        status
                    })
                    .then(() => {
                        console.log("Document successfully written!");
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                    });

                self.setState({ ...INITIAL_STATE }, () => {
                    self.setState({ success: 'Changes saved successfull.', loading:false });
                });                                
            })
            .catch(function(error) {
                var message = error;
                console.log(message);
                self.setState({ ...INITIAL_STATE }, () => {                    
                    // console.log(message);
                    self.setState({ error: 'An error has occured, provide this info to your provider: '+ message, loading: false });                    
                });                
            });
    }
    
    // on holiday calendar edit
    onSubmitEdit = event => {
        event.preventDefault();
        var self = this;
        self.setState({ loading: true });
        const {holidayCalendar, holidayCalendarEdit} = this.state;
        // parse orginal document dates to find differences
        let original = JSON.parse(JSON.stringify(holidayCalendarEdit));
        let dateParsed = this.parseDates(original.details.holidays);
        original.details.holidays = dateParsed;

        if (JSON.stringify(holidayCalendar) === JSON.stringify(original)) {
            this.setState({error: 'There are no changes to save.', loading:false})
            return
        }

        const data = holidayCalendar;
                
        const dates = [];
        for (var i = 0; i < data.details.holidays.length; i++) {            
            if (data.details.holidays[i].date === undefined || data.details.holidays[i].date === '' || data.details.holidays[i].date ===  null ) {
                self.setState({ error: 'There is an error with the date of holiday.', loading:false });
                return
            }
            dates.push(data.details.holidays[i].date);
        }
        // filter duplicated date values
        let datesResult = this.useFilter(dates);            
        if (data.details.holidays.length !== datesResult.length) {
            self.setState({ error: 'There are duplicated values in the holidays dates.', loading:false });
            return
        }
        
        const user = this.context;
        let timestamp = this.props.firebase.getTimestamp();        
        data.lastModifiedBy = user.firstName + ' ' + user.lastName;
        data.lastDateModifiedOn = timestamp;
        
        this.props.firebase.attHolidayCalendar()
            .doc(data.id)
            .update(data)
            .then(() => {
                
                let docId = data.id;
                let companyId = data.companyId;
                let name = data.name;
                let status = data.status;

                this.props.firebase.attHolidayCalendarSearch()
                    .doc(docId)
                    .update({
                        name,
                        companyId,
                        status,
                        lastDateModifiedOn: this.props.firebase.getTimestamp(),
                    })
                    .then(() => {
                        console.log("Document successfully written!");
                    })
                    .catch((error) => {
                        console.error("Error writing document: ", error);
                    });

                self.setState({ ...INITIAL_STATE }, () => {
                    self.setState({ success: 'Changes saved successfull.', loading:false });
                });                                
            })
            .catch(function(error) {
                var message = error;
                console.log(message);
                self.setState({ ...INITIAL_STATE }, () => {                    
                    // console.log(message);
                    self.setState({ error: 'An error has occured, provide this info to your provider: '+ message, loading: false });                    
                });                
            });
        
    }

    // Using Array.filter to find duplicated items 
    useFilter = arr => {
        return arr.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    };
    
    showForm = () => {
        this.setState({ showCreateForm: true, isDisabled:false, showEditForm: false });        
    }
    
    hideForm = () => {
        this.setState({ showCreateForm: false, isDisabled:true });
    };

    showEditF = () => {
        this.setState({ showEditForm: true, showForm: false });        
    }
    
    hideEditF = () => {
        this.setState({ showEditForm: false });
    };
    
    enableFields = () => {        
        this.setState({ isDisabled: false })
    };

    disableFields = () => {
        let clone = JSON.parse(JSON.stringify(this.state.holidayCalendarEdit));
        let dates = this.parseDates(clone.details.holidays);
        clone.details.holidays = dates;
        this.setState({ isDisabled: true, holidayCalendar: clone })
    };

    parseDates = (item) => {
        for (var i = 0; i < item.length; i++) {
            if (item[i].date.getMonth === undefined) {
                if (item[i].date !== null) {
                let dateMilliseconds = (item[i].date.seconds * 1000) + (item[i].date.nanoseconds / 1000000);          
                
                item[i].date = new Date(dateMilliseconds);
                item[i].date.setHours(0, 0, 0, 0);
                }
            }
        }
        return item;      
    };

    // get holiday calendar by id
    getElementId = (id) => {
        this.props.firebase.attHolidayCalendar()
            .doc(id.value)
            .get().then((doc) => {
                if (doc.exists) {
                    // console.log("Document data:", doc.data());
                    let backup = doc.data();
                    backup.id = doc.id;

                    let data = doc.data();
                    data.id = doc.id;
                    
                    let dates = this.parseDates(data.details.holidays);
                    data.details.holidays = dates;
                    this.setState({ holidayCalendar: data, holidayCalendarEdit: backup, showEditForm: true });
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
    }

    render () {
        const { name } = this.state;
    
    const isInvalid = name === '';
        return (
            <>
            { !this.state.loading ? (
                <>
                    <div className="row mb-3">
                        <div className="col-12">
                            <h2>Holiday Calendars</h2>
                            { this.state.error &&
                                <div className="alert alert-danger" role="alert">
                                    { this.state.error }
                                </div> 
                            }
                            { this.state.success &&
                                <div className="alert alert-success" role="alert">
                                    { this.state.success }
                                </div> 
                            }
                        </div>
                        { !this.state.showCreateForm && this.state.isDisabled &&
                        <div className="container">
                            <div className="row mb-3 bg-light">
                                <div className="col-3">
                                    <Search getElementId={this.getElementId} collection={this.props.firebase.attHolidayCalendarSearch()}/>
                                </div>
                                <div className="col-2 offset-7">
                                    <button type="button" className="btn btn-success btn-sm" onClick={this.showForm}>Create New WorkSchedule</button>
                                </div>
                            </div>
                        </div>
                        }    
                    </div>

                    <div className="row mb-3">
                        { this.state.showCreateForm &&
                            <form className="col" onSubmit={this.onSubmit}>
                                <div className="row">
                                    <div className="col-lg-6">            
                                        <div className="row mb-3">
                                            <label htmlFor="inputName3" className="col col-form-label">Holiday Calendar Details</label>                    
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputName3" className="col-sm-3 col-form-label col-form-label-sm">Name</label>
                                            <div className="col-sm-3">
                                                <input type="text" name="name" value={name} onChange={this.onChange} className="form-control form-control-sm" id="inputName3" required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-12">
                                        <div className="row mb-3">
                                            <label htmlFor="inputHoliday" className="col-sm-2 col-form-label col-form-label-sm">Date</label>
                                            <label htmlFor="inputHolidayClass" className="col-sm-1 col-form-label col-form-label-sm">Class</label>
                                            <label htmlFor="inputHolidayName" className="col-sm-2 col-form-label col-form-label-sm">Holiday</label>
                                        </div>
                                        { this.state.details.holidays.map((item, index) => (
                                            <div className="row" key={index}>
                                                <div className="col-sm-2">
                                                    <DatePicker
                                                        dateFormat="dd/MM/yyyy" className="form-control form-control-sm"
                                                        selected={item.date}
                                                        onChange={(e) => this.onChangeDetails(index, e, 0)}                                                    
                                                        disabled={this.state.isDisabled}
                                                    />
                                                </div>
                                                
                                                <div className="col-sm-1">
                                                    <select className="form-select form-select-sm" name="holidayClass" value={item.class} onChange={(e) => this.onChangeDetails(index, e, 1)} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                                        <option value="Full">Full</option>
                                                        <option value="Half">Half</option>
                                                        <option value="None">None</option>
                                                    </select>                
                                                </div>
                                                <div className="col-sm-2">
                                                    <input type="text" name="holiday" value={item.holiday} onChange={(e) => this.onChangeDetails(index, e, 2)} className="form-control form-control-sm" id="inputName4" required />
                                                </div>
                                                { !this.state.isDisabled &&
                                                <div className="col-md-1">            
                                                    <FontAwesomeIcon icon="plus-circle" type="button" onClick={this.onAddItem} />
                                                    {index === 0 ? (
                                                        <span></span>
                                                    ) : (
                                                        <span> <FontAwesomeIcon icon="trash" type="button" onClick={(e)=>this.onRemoveItem(index, e)} /></span>
                                                    )}                                            
                                                </div> 
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="buttons">
                                        <button type="submit" disabled={isInvalid} className="btn btn-primary btn-sm">Save Changes</button>                                        
                                        <button type="button" className="btn btn-danger btn-sm" onClick={this.hideForm}>Cancel</button>
                                    </div>                                    
                                </div>                                                                
                            </form>
                            }
                    </div>
                    
                    { this.state.showEditForm && 
                        <HolidayCalendarVisualization 
                            data={this.state.holidayCalendar}
                            enableFields={this.enableFields}
                            disableFields={this.disableFields}
                            onAddItemEdit={this.onAddItemEdit}
                            onRemoveItemEdit={this.onRemoveItemEdit}
                            isDisabled={this.state.isDisabled}
                            onChangeDetailsEdit={this.onChangeDetailsEdit}
                            onChangeEdit={this.onChangeEdit}
                            hideEditF={this.hideEditF}
                            onSubmitEdit={this.onSubmitEdit}
                        />
                    }
                </>
            ) : (
                <LoadingScreen />
            )
            }
            </>
            
        )
    }
}

class HolidayCalendarVisualization extends Component {
    render () {        
        const isInvalid = this.props.data.name === '';
        
        return (
            <div className="row mb-3">                
                {this.props.isDisabled && 
                <div className="col-12">
                    <a href="#top" onClick={this.props.enableFields}>Edit Holiday Calendar</a>
                </div> 
                }
                <form className="col" onSubmit={this.props.onSubmitEdit}>
                    <div className="row">
                        <div className="col-lg-6">            
                            <div className="row mb-3">
                                <label htmlFor="inputName3" className="col col-form-label col-form-label-sm">Holiday Calendar Details</label>                    
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputName3" className="col-sm-3 col-form-label col-form-label-sm">Name</label>
                                <div className="col-sm-3">
                                    <input type="text" name="name" value={this.props.data.name} onChange={this.props.onChangeEdit} className="form-control form-control-sm" id="inputName3" required  disabled={this.props.isDisabled}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="imputStatus" className="col-sm-3 col-form-label col-form-label-sm">Status</label>
                                <div className="col-sm-3">
                                    <select className="form-select form-select-sm" name="status" value={this.props.data.status} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>                    
                                    </select>                
                                </div>
                            </div>
                        </div>

                        <div  className="col-lg-12">
                            <div className="row mb-3">
                                <label htmlFor="inputHoliday" className="col-sm-2 col-form-label col-form-label-sm">Date</label>
                                <label htmlFor="inputHolidayClass" className="col-sm-1 col-form-label col-form-label-sm">Class</label>
                                <label htmlFor="inputHolidayName" className="col-sm-2 col-form-label col-form-label-sm">Holiday</label>
                            </div>
                            { this.props.data.details.holidays.map((item, index) => (
                                <div className="row" key={index}>
                                    <div className="col-sm-2">
                                        <DatePicker
                                            dateFormat="dd/MM/yyyy" className="form-control form-control-sm"
                                            selected={item.date}
                                            onChange={(e) => this.props.onChangeDetailsEdit(index, e, 0)}                                                    
                                            disabled={this.props.isDisabled}
                                        />
                                    </div>
                                    
                                    <div className="col-sm-1">
                                        <select className="form-select form-select-sm" name="holidayClass" value={item.class} onChange={(e) => this.props.onChangeDetailsEdit(index, e, 1)} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                            <option value="Full">Full</option>
                                            <option value="Half">Half</option>
                                            <option value="None">None</option>
                                        </select>                
                                    </div>
                                    <div className="col-sm-2">
                                        <input type="text" name="holiday" value={item.holiday} onChange={(e) => this.props.onChangeDetailsEdit(index, e, 2)} className="form-control form-control-sm" required disabled={this.props.isDisabled} />
                                    </div>
                                    { !this.props.isDisabled &&
                                    <div className="col-md-1">            
                                        <FontAwesomeIcon icon="plus-circle" type="button" onClick={this.props.onAddItemEdit} />
                                        {index === 0 ? (
                                            <span></span>
                                        ) : (
                                            <span> <FontAwesomeIcon icon="trash" type="button" onClick={(e)=>this.props.onRemoveItemEdit(index, e)} /></span>
                                        )}                                            
                                    </div> 
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="row mb-3">
                        
                        {!this.props.isDisabled &&
                        <div className="buttons">
                            <button type="submit" disabled={isInvalid} className="btn btn-primary btn-sm">Save Changes</button>                                        
                            <button type="button" className="btn btn-danger btn-sm" onClick={this.props.disableFields} >Cancel</button>
                        </div>
                        }
                    </div>                                        
                </form>                                
            </div>
        )
    }
}

const condition = authUser =>
  authUser && authUser.role === ROLES.ADMIN;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(HolidayCalendar);