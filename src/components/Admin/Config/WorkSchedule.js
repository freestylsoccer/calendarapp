import React, { Component } from 'react';
import { compose } from 'recompose';
import { withFirebase } from '../../Firebase';

import { withAuthorization, AuthUserContext } from '../../Session';
import * as ROLES from '../../constants/roles';

import LoadingScreen from '../../Loading/LoadingScreen';
import Modal from '../../Modal/Modal';
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
    workSchedule: {},
    workScheduleEdit: {}, // workSchedule backup when edit is canceled
    isDisabled: true,
    firstDayWeek: 'Monday',
    averageHoursPerDay: 8,
    averageHourPerWeek: 48,
    averageWorkingDaysPerWeek: 6,
    crossMidnightAllowed: false,
    mondayCategory:'Planned Hours',
    tuesdayCategory: 'Planned Hours',
    wednesdayCategory: 'Planned Hours',
    thursdayCategory: 'Planned Hours',
    fridayCategory: 'Planned Hours',
    saturdayCategory: 'Non-Working Day',
    sundayCategory: 'Non-Working Day',
    loading: false,
    show: false,
    showEditForm: false,
    showCreateForm: false,    
    workScheduleDayDetailsMonday: {
        day: 'Monday',
        category: '',
        segments: [
            {
                startTime: new Date(2020, 0, 0, 8, 0, 0, 0),
                endTime: new Date(2020, 0, 0, 18, 0, 0, 0),
                duration: 600,
                dayCategory:'Scheduled Working time',
            }
        ]
    },
    workScheduleDayDetailsTuesday: {
        day: 'Tuesday',
        category: '',
        segments: [
            {
                startTime: new Date(2020, 0, 0, 8, 0, 0, 0),
                endTime: new Date(2020, 0, 0, 18, 0, 0, 0),
                duration: 600,
                dayCategory:'Scheduled Working time',
            }
        ]
    },
    workScheduleDayDetailsWednesday: {
        day: 'Wednesday',
        category: '',
        segments: [
            {
                startTime: new Date(2020, 0, 0, 8, 0, 0, 0),
                endTime: new Date(2020, 0, 0, 18, 0, 0, 0),
                duration: 600,
                dayCategory:'Scheduled Working time',
            }
        ]
    },
    workScheduleDayDetailsThursday: {
        day: 'Thursday',
        category: '',
        segments: [
            {
                startTime: new Date(2020, 0, 0, 8, 0, 0, 0),
                endTime: new Date(2020, 0, 0, 18, 0, 0, 0),
                duration: 600,
                dayCategory:'Scheduled Working time',
            }
        ]
    },
    workScheduleDayDetailsFriday: {
        day: 'Friday',
        category: '',
        segments: [
            {
                startTime: new Date(2020, 0, 0, 8, 0, 0, 0),
                endTime: new Date(2020, 0, 0, 18, 0, 0, 0),
                duration: 600,
                dayCategory:'Scheduled Working time',
            }
        ]
    },
    workScheduleDayDetailsSaturday: {
        day: 'Saturday',
        category: '',
        segments: [
            {
                startTime: new Date(2020, 0, 0, 8, 0, 0, 0),
                endTime: new Date(2020, 0, 0, 18, 0, 0, 0),
                duration: 600,
                dayCategory:'Scheduled Working time',
            }
        ]
    },
    workScheduleDayDetailsSunday: {
        day: 'Sunday',
        category: '',
        segments: [
            {
                startTime: null,
                endTime: null,
                duration: 0,
                dayCategory:'Scheduled Working time',
            }
        ]
    },
    workScheduleDayDetails: {
        day: '',
        category: '',
        segments: [
            {
                startTime: null,
                endTime: null,
                duration: 0,
                dayCategory:'Scheduled Working time',
            }
        ]
    },
};

class WorkSchedule extends Component {
    constructor(props) {
      super(props);
      
      this.state = {
        ...INITIAL_STATE,
      };

      this.showModal = this.showModal.bind(this);
      this.hideModal = this.hideModal.bind(this); 
    } 
    static contextType = AuthUserContext;

    onClick (day, category) {        
        let details = {}        
        
        switch(day) {
            case 'Monday':
                details = {...this.state.workScheduleDayDetailsMonday};
                details.category = category;

                this.setState({ workScheduleDayDetailsMonday: details, workScheduleDayDetails: details },
                    () => {this.showModal();});
              break;
            case 'Tuesday':
                details = {...this.state.workScheduleDayDetailsTuesday};
                details.category = category;

                this.setState({ workScheduleDayDetailsTuesday: details, workScheduleDayDetails: details },
                    () => {this.showModal();});
              break;
            case 'Wednesday':
                details = {...this.state.workScheduleDayDetailsWednesday};
                details.category = category;

                this.setState({ workScheduleDayDetailsWednesday: details, workScheduleDayDetails: details },
                    () => {this.showModal();});
                break;
            case 'Thursday':
                details = {...this.state.workScheduleDayDetailsThursday};
                details.category = category;

                this.setState({ workScheduleDayDetailsThursday: details, workScheduleDayDetails: details },
                    () => {this.showModal();});
                break;
            case 'Friday':
                details = {...this.state.workScheduleDayDetailsFriday};
                details.category = category;

                this.setState({ workScheduleDayDetailsFriday: details, workScheduleDayDetails: details },
                    () => {this.showModal();});
                break;
            case 'Saturday':
                details = {...this.state.workScheduleDayDetailsSaturday};
                details.category = category;

                this.setState({ workScheduleDayDetailsSaturday: details, workScheduleDayDetails: details },
                    () => {this.showModal();});
                break;            
            case 'Sunday':
                details = {...this.state.workScheduleDayDetailsSunday};
                details.category = category;

                this.setState({ workScheduleDayDetailsSunday: details, workScheduleDayDetails: details },
                    () => {this.showModal();});
                break;
            default:
              console.log('error');
        }                     
    }
    
    onClickTwo = (dayDetails) => {        
        if (this.state.isDisabled) {
            let details = {};
            details = JSON.parse(JSON.stringify(dayDetails));
            for (var i = 0; i < details.segments.length; i++) {
                if (details.segments[i].startTime !== null) {
                    let startMilliseconds = (details.segments[i].startTime.seconds * 1000) + (details.segments[i].startTime.nanoseconds / 1000000);
                    let endMilliseconds = (details.segments[i].endTime.seconds * 1000) + (details.segments[i].endTime.nanoseconds / 1000000);
                    
                    details.segments[i].startTime = new Date(startMilliseconds);
                    details.segments[i].endTime = new Date(endMilliseconds);
                }
            }            
            this.setState({ workScheduleDayDetails: details }, () => {this.showModal();});
        } else {
            let details = {};
            details = dayDetails;
            for (var j = 0; j < details.segments.length; j++) {
                if (details.segments[j].startTime !== null) {                    
                    if(details.segments[j].startTime.getMonth === undefined) {
                        let startMilliseconds = (details.segments[j].startTime.seconds * 1000) + (details.segments[j].startTime.nanoseconds / 1000000);
                        let endMilliseconds = (details.segments[j].endTime.seconds * 1000) + (details.segments[j].endTime.nanoseconds / 1000000);
                        
                        details.segments[j].startTime = new Date(startMilliseconds);
                        details.segments[j].endTime = new Date(endMilliseconds);
                    }
                }
            }
            this.setState({ workScheduleDayDetails: details }, () => {this.showModal();});
        }        
    }

    showModal = () => {
        this.setState({ show: true });        
    }
    
    hideModal = () => {
        this.setState({ show: false });
    };
    
    onChange = event => {
        this.setState({ [event.target.name]: event.target.value });
    };

    onChangeDetails = (index, event, i) => {                
        let clone = {...this.state.workScheduleDayDetails};        
        let item = {...clone.segments[index]}
        if (i === 0) {
            item.startTime = event;
        } else if (i === 1) {
            item.endTime = event;
        } else {
            item.dayCategory = event.target.value;
        }
        if (item.endTime && item.startTime){
            item.duration = this.getDifferenceInMinutes(item.startTime, item.endTime);
        } else{
            item.duration = 0;
        }
        clone.segments[index] = item;        
        this.setState({ workScheduleDayDetails: clone });
    };

    onChangeEdit = event => {
        event.preventDefault()
        
        this.setState({
            ...this.state,
            workSchedule: { ...this.state.workSchedule, [event.target.name]: event.target.value },
        });        
    };

    onAddItem = () => {        
        let clone = {...this.state.workScheduleDayDetails};        
        let item = {
                startTime: new Date(),
                endTime: new Date(),
                duration: 600,
                dayCategory:'Scheduled Working time',
                }
        item.startTime.setMilliseconds(0);
        item.endTime.setMilliseconds(0);
        item.startTime.setSeconds(0);
        item.endTime.setSeconds(0);
        item.startTime.setMinutes(0);
        item.endTime.setMinutes(0);
        item.startTime.setHours(8);
        item.endTime.setHours(18);
        clone.segments.push(item);
        this.setState({ workScheduleDayDetails: clone });
    }

    onRemoveItem = (index, e) => {
        let clone = {...this.state.workScheduleDayDetails};        
        clone.segments.pop(index);        
        this.setState({ workScheduleDayDetails: clone });
    }

    getDifferenceInMinutes(date1, date2) {
        date1.setMilliseconds(0);
        date2.setMilliseconds(0);
        date1.setSeconds(0);
        date2.setSeconds(0);
        const diffInMs = Math.abs(date2 - date1);
        return diffInMs / (1000 * 60);
    }    

    onSubmit = event => {
        event.preventDefault();
        var self = this;
        self.setState({ loading: true });
        const { name,
                firstDayWeek,
                averageHoursPerDay,
                averageHourPerWeek,
                averageWorkingDaysPerWeek,
                crossMidnightAllowed,
                mondayCategory,
                tuesdayCategory,
                wednesdayCategory,
                thursdayCategory,
                fridayCategory,
                saturdayCategory,
                sundayCategory,
                workScheduleDayDetailsMonday,
                workScheduleDayDetailsTuesday,
                workScheduleDayDetailsWednesday,
                workScheduleDayDetailsThursday,
                workScheduleDayDetailsFriday,
                workScheduleDayDetailsSaturday,
                workScheduleDayDetailsSunday
        } = this.state;

        const data = { name,
                    firstDayWeek,
                    averageHoursPerDay,
                    averageHourPerWeek,
                    averageWorkingDaysPerWeek,
                    crossMidnightAllowed,
                    mondayCategory,
                    tuesdayCategory,
                    wednesdayCategory,
                    thursdayCategory,
                    fridayCategory,
                    saturdayCategory,
                    sundayCategory,
                    workScheduleDayDetailsMonday,
                    workScheduleDayDetailsTuesday,
                    workScheduleDayDetailsWednesday,
                    workScheduleDayDetailsThursday,
                    workScheduleDayDetailsFriday,
                    workScheduleDayDetailsSaturday,
                    workScheduleDayDetailsSunday,
                    status: 'Active',
        }
        data.workScheduleDayDetailsMonday.category = data.mondayCategory;
        data.workScheduleDayDetailsTuesday.category = data.tuesdayCategory;
        data.workScheduleDayDetailsWednesday.category = data.wednesdayCategory;
        data.workScheduleDayDetailsThursday.category = data.thursdayCategory;
        data.workScheduleDayDetailsFriday.category = data.fridayCategory;
        data.workScheduleDayDetailsSaturday.category = data.saturdayCategory;
        data.workScheduleDayDetailsSunday.category = data.sundayCategory;
                
        const listItems = {'monday': data.workScheduleDayDetailsMonday, 'tuesday': data.workScheduleDayDetailsTuesday, 
                        'wednesday': data.workScheduleDayDetailsWednesday,'thursday': data.workScheduleDayDetailsThursday, 
                        'friday': data.workScheduleDayDetailsFriday, 'saturday': data.workScheduleDayDetailsSaturday,
                        'sunday': data.workScheduleDayDetailsSunday};            
            
        for (var item in listItems) {            
            const arrStart = [];
            const arrEnd = [];
            
            for (var i = 0; i < listItems[item].segments.length; i++) {                
                if (listItems[item].category === 'Planned Hours' && listItems[item].segments[i].duration === 0) {                    
                    self.setState({ error: 'There is an error with the ' + listItems[item].day + ' details.', loading:false });
                    return
                }
                if (listItems[item].category === 'Planned Hours') {
                    let checkin = listItems[item].segments[i].startTime.getHours()+':'+listItems[item].segments[i].startTime.getMinutes();
                    let checkout = listItems[item].segments[i].endTime.getHours()+':'+listItems[item].segments[i].endTime.getMinutes();
                    arrStart.push(checkin);
                    arrEnd.push(checkout);
                }
            }
            let startResult = this.useFilter(arrStart);
            let endResult = this.useFilter(arrEnd);

            if (listItems[item].category === 'Planned Hours') {
                if (listItems[item].segments.length !== startResult.length || listItems[item].segments.length !== endResult.length) {
                    self.setState({ error: 'There are duplicated values in the ' + listItems[item].day + ' details.', loading:false });
                    return
                }
            }
        }

        const timestamp = this.props.firebase.getTimestamp();
        const user = this.context;
        data.companyId = user.companyId;
        data.createdBy = user.fistName + ' ' + user.lastName;
        data.createdOn = timestamp;

        this.props.firebase.attWorkSchedule()
            .add(data)
            .then((resp) => {
                
                let docId = resp.id;
                let companyId = data.companyId;
                let name = data.name;
                let status = data.status;

                this.props.firebase.attWorkScheduleSearch()
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

    onSubmitEdit = event => {
        event.preventDefault();
        var self = this;
        self.setState({ loading: true });
        const {workSchedule, workScheduleEdit} = this.state;
        if (JSON.stringify(workSchedule) === JSON.stringify(workScheduleEdit)) {
            this.setState({error: 'There are no changes to save.', loading:false})
            return
        }

        const data = workSchedule;

        data.workScheduleDayDetailsMonday.category = data.mondayCategory;
        data.workScheduleDayDetailsTuesday.category = data.tuesdayCategory;
        data.workScheduleDayDetailsWednesday.category = data.wednesdayCategory;
        data.workScheduleDayDetailsThursday.category = data.thursdayCategory;
        data.workScheduleDayDetailsFriday.category = data.fridayCategory;
        data.workScheduleDayDetailsSaturday.category = data.saturdayCategory;
        data.workScheduleDayDetailsSunday.category = data.sundayCategory;

        const listItems = {'monday': data.workScheduleDayDetailsMonday, 'tuesday': data.workScheduleDayDetailsTuesday, 
                        'wednesday': data.workScheduleDayDetailsWednesday,'thursday': data.workScheduleDayDetailsThursday, 
                        'friday': data.workScheduleDayDetailsFriday, 'saturday': data.workScheduleDayDetailsSaturday,
                        'sunday': data.workScheduleDayDetailsSunday};            
                    
        for (var item in listItems) {            
            const arrStart = [];
            const arrEnd = [];
            
            for (var i = 0; i < listItems[item].segments.length; i++) {                
                if (listItems[item].category === 'Planned Hours' && listItems[item].segments[i].duration === 0) {                    
                    self.setState({ error: 'There is an error with the ' + listItems[item].day + ' details.', loading:false });
                    return
                }
                if (listItems[item].category === 'Planned Hours') {
                    if(listItems[item].segments[i].startTime.getMonth === undefined) {
                        let startMilliseconds = (listItems[item].segments[i].startTime.seconds * 1000) + (listItems[item].segments[i].startTime.nanoseconds / 1000000);
                        let endMilliseconds = (listItems[item].segments[i].endTime.seconds * 1000) + (listItems[item].segments[i].endTime.nanoseconds / 1000000);
                        
                        listItems[item].segments[i].startTime = new Date(startMilliseconds);
                        listItems[item].segments[i].endTime = new Date(endMilliseconds);
                    }

                    let checkin = listItems[item].segments[i].startTime.getHours()+':'+listItems[item].segments[i].startTime.getMinutes();
                    let checkout = listItems[item].segments[i].endTime.getHours()+':'+listItems[item].segments[i].endTime.getMinutes();
                    arrStart.push(checkin);
                    arrEnd.push(checkout);
                }
            }
            let startResult = this.useFilter(arrStart);
            let endResult = this.useFilter(arrEnd);

            if (listItems[item].category === 'Planned Hours') {
                if (listItems[item].segments.length !== startResult.length || listItems[item].segments.length !== endResult.length) {
                    self.setState({ error: 'There are duplicated values in the ' + listItems[item].day + ' details.', loading:false });
                    return
                }
            }
        }
        
        const user = this.context;
        let timestamp = this.props.firebase.getTimestamp();        
        data.lastModifiedBy = user.firstName + ' ' + user.lastName;
        data.lastDateModifiedOn = timestamp;
        
        this.props.firebase.attWorkSchedule()
            .doc(data.id)
            .update(data)
            .then(() => {
                
                let docId = data.id;
                let companyId = data.companyId;
                let name = data.name;
                let status = data.status;

                this.props.firebase.attWorkScheduleSearch()                    
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

    // Using Array.filter
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
        let clone = JSON.parse(JSON.stringify(this.state.workScheduleEdit));
        this.setState({ isDisabled: true, workSchedule: clone })
    }

    getElementId = (id) => {
        this.props.firebase.attWorkSchedule()
            .doc(id.value)
            .get().then((doc) => {
                if (doc.exists) {
                    // console.log("Document data:", doc.data());
                    let data = doc.data();
                    data.id = doc.id;
                    this.setState({ workSchedule: data, workScheduleEdit: data, showEditForm: true })
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
    }

    render () {
        const { name,
                firstDayWeek,
                averageHoursPerDay,
                averageHourPerWeek,
                averageWorkingDaysPerWeek,
                crossMidnightAllowed,
                mondayCategory,
                tuesdayCategory,
                wednesdayCategory,
                thursdayCategory,
                fridayCategory,
                saturdayCategory,
                sundayCategory,
                workScheduleDayDetails } = this.state;
        
        const isInvalid = name === '' ||
            averageHoursPerDay === '' ||
            averageHourPerWeek === '' ||
            averageWorkingDaysPerWeek === '';
        return (
            <>
                { this.state.loading === false ? (
                    <>
                        <div className="row mb-3">
                            <div className="col-12">
                                <h2>Work Schedules</h2>
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
                                        <Search getElementId={this.getElementId} collection={this.props.firebase.attWorkScheduleSearch()}/>
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
                                            <label htmlFor="inputName3" className="col col-form-label">Work Schedule Details</label>                    
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputName3" className="col-sm-3 col-form-label col-form-label-sm">Name</label>
                                            <div className="col-sm-3">
                                                <input type="text" name="name" value={name} onChange={this.onChange} className="form-control form-control-sm" id="inputName3" required />
                                            </div>
                                        </div>
                                        <div className="row mb-3">            
                                            <label htmlFor="inputFirstDayWeek" className="col-sm-3 col-form-label col-form-label-sm">First Day of Week</label>
                                            <div className="col-sm-3">
                                                <select className="form-select form-select-sm" name="firstDayWeek" value={firstDayWeek} onChange={this.onChange} aria-label=".form-select-sm example" required>                    
                                                    <option value="Monday" defaultValue>Monday</option>
                                                    <option value="Tuesday">Tuesday</option>
                                                    <option value="Wednesday">Wednesday</option>
                                                    <option value="Thursday">Thursday</option>
                                                    <option value="Friday">Friday</option>
                                                    <option value="Saturday">Saturday</option>
                                                    <option value="Sunday">Sunday</option>
                                                </select>                
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputHourDay" className="col-sm-4 col-form-label col-form-label-sm">Average Hours Per Day</label>
                                            <div className="col-sm-2">
                                                <input type="number" name="averageHoursPerDay" value={averageHoursPerDay} onChange={this.onChange} className="form-control form-control-sm" id="inputHourDay" min="0" max="24" step="0.5" required/>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputHoursWeek" className="col-sm-4 col-form-label col-form-label-sm">Average Hour Per Week</label>
                                            <div className="col-sm-2">
                                                <input type="number" name="averageHourPerWeek" value={averageHourPerWeek} onChange={this.onChange} className="form-control form-control-sm" id="inputHoursWeek" min="0" max="168" step="8" required/>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputDaysKeek" className="col-sm-4 col-form-label col-form-label-sm">Average Working Days Per Week</label>
                                            <div className="col-sm-2">
                                                <input type="number" name="averageWorkingDaysPerWeek" value={averageWorkingDaysPerWeek} onChange={this.onChange} className="form-control form-control-sm" id="inputDaysKeek" min="0" max="7" step="1" required/>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputDaysKeek" className="col-sm-4 col-form-label col-form-label-sm">Cross Midnight Allowed</label>
                                            <div className="col-sm-2">
                                                <select className="form-select form-select-sm" name="crossMidnightAllowed" value={crossMidnightAllowed} onChange={this.onChange} aria-label=".form-select-sm example" required>
                                                    <option value="No" defaultValue>No</option>
                                                    <option value="Yes">Yes</option>                    
                                                </select>                
                                            </div>
                                        </div>                                        
                                    </div>

                                    <div  className="col-lg-6">
                                        <div className="row mb-3">
                                            <label htmlFor="inputMonday" className="col-sm-3 col-form-label col-form-label-sm">Day</label>
                                            <label className="col-sm-4 col-form-label col-form-label-sm">Category</label>
                                            <label htmlFor="inputMondayDetails" className="col-sm-3 col-form-label col-form-label-sm">Details</label>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputMonday" className="col-sm-2 col-form-label col-form-label-sm">Monday</label>
                                            <div className="col-sm-4">
                                                <select className="form-select form-select-sm" name="mondayCategory" value={mondayCategory} onChange={this.onChange} aria-label=".form-select-sm example" required>
                                                    <option value="Planned Hours">Planned Hours</option>
                                                    <option value="Non-Working Day">Non-Working Day</option>
                                                </select>                
                                            </div>
                                            <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.onClick('Monday', mondayCategory)}>add Details</button>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputTuesday" className="col-sm-2 col-form-label col-form-label-sm">Tuesday</label>
                                            <div className="col-sm-4">
                                                <select className="form-select form-select-sm" name="tuesdayCategory" value={tuesdayCategory} onChange={this.onChange} aria-label=".form-select-sm example" required>
                                                    <option value="Planned Hours">Planned Hours</option>
                                                    <option value="Non-Working Day">Non-Working Day</option>
                                                </select>                
                                            </div>
                                            <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.onClick('Tuesday', tuesdayCategory)}>add Details</button>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputWednesday" className="col-sm-2 col-form-label col-form-label-sm">Wednesday</label>
                                            <div className="col-sm-4">
                                                <select className="form-select form-select-sm" name="wednesdayCategory" value={wednesdayCategory} onChange={this.onChange} aria-label=".form-select-sm example" required>
                                                    <option value="Planned Hours">Planned Hours</option>
                                                    <option value="Non-Working Day">Non-Working Day</option>
                                                </select>                
                                            </div>
                                            <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.onClick('Wednesday', wednesdayCategory)}>add Details</button>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputThursday" className="col-sm-2 col-form-label col-form-label-sm">Thursday</label>
                                            <div className="col-sm-4">
                                                <select className="form-select form-select-sm" name="thursdayCategory" value={thursdayCategory} onChange={this.onChange} aria-label=".form-select-sm example" required>
                                                    <option value="Planned Hours">Planned Hours</option>
                                                    <option value="Non-Working Day">Non-Working Day</option>
                                                </select>                
                                            </div>
                                            <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.onClick('Thursday', thursdayCategory)}>add Details</button>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputFriday" className="col-sm-2 col-form-label col-form-label-sm">Friday</label>
                                            <div className="col-sm-4">
                                                <select className="form-select form-select-sm" name="fridayCategory" value={fridayCategory} onChange={this.onChange} aria-label=".form-select-sm example" required>
                                                    <option value="Planned Hours">Planned Hours</option>
                                                    <option value="Non-Working Day">Non-Working Day</option>
                                                </select>                
                                            </div>
                                            <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.onClick('Friday', fridayCategory)}>add Details</button>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputSaturday" className="col-sm-2 col-form-label col-form-label-sm">Saturday</label>
                                            <div className="col-sm-4">
                                                <select className="form-select form-select-sm" name="saturdayCategory" value={saturdayCategory} onChange={this.onChange} aria-label=".form-select-sm example" required>
                                                    <option value="Non-Working Day">Non-Working Day</option>
                                                    <option value="Planned Hours">Planned Hours</option>
                                                </select>                
                                            </div>
                                            <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.onClick('Saturday', saturdayCategory)}>add Details</button>
                                        </div>
                                        <div className="row mb-3">
                                            <label htmlFor="inputSunday" className="col-sm-2 col-form-label col-form-label-sm">Sunday</label>
                                            <div className="col-sm-4">
                                                <select className="form-select form-select-sm" name="sundayCategory" value={sundayCategory} onChange={this.onChange} aria-label=".form-select-sm example" required>
                                                <option value="Non-Working Day">Non-Working Day</option>
                                                <option value="Planned Hours">Planned Hours</option>
                                                </select>                
                                            </div>
                                            <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.onClick('Sunday', sundayCategory)}>add Details</button>
                                        </div>
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
                            <Modal show={this.state.show} handleClose={this.hideModal} title={'WorkSchedule Day Details'}>
                                <WorkScheduleDayDetails workScheduleDayDetails={workScheduleDayDetails} 
                                onChangeDetails={this.onChangeDetails} onAddItem={this.onAddItem} 
                                onRemoveItem={this.onRemoveItem} isDisabled={this.state.isDisabled} />
                            </Modal>
                        </div>                        
                        
                        { this.state.showEditForm && 
                        <WorkScheduleVisualization 
                            data={this.state.workSchedule}
                            enableFields={this.enableFields}
                            disableFields={this.disableFields} 
                            isDisabled={this.state.isDisabled}
                            onChangeEdit={this.onChangeEdit} 
                            onClickTwo={this.onClickTwo} 
                            hideEditF={this.hideEditF}
                            onSubmitEdit={this.onSubmitEdit}
                        />
                        }
                        
                    </>
                ) : (
                    <LoadingScreen />
                )}
            </>
        )
    }
}

class WorkScheduleVisualization extends Component {
    render () {        
        const isInvalid = this.props.data.name === '' ||
            this.props.data.averageHoursPerDay === '' ||
            this.props.data.averageHourPerWeek === '' ||
            this.props.data.averageWorkingDaysPerWeek === '';
        
        return (
            <div className="row mb-3">                
                {this.props.isDisabled && 
                <div className="col-12">
                    <a href="#top" onClick={this.props.enableFields}>Edit WorkSchedule</a>
                </div> 
                }
                <form className="col" onSubmit={this.props.onSubmitEdit}>
                    <div className="row">
                        <div className="col-lg-6">            
                            <div className="row mb-3">
                                <label htmlFor="inputName3" className="col col-form-label col-form-label-sm">Work Schedule Details</label>                    
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputName3" className="col-sm-3 col-form-label col-form-label-sm">Name</label>
                                <div className="col-sm-3">
                                    <input type="text" name="name" value={this.props.data.name} onChange={this.props.onChangeEdit} className="form-control form-control-sm" id="inputName3" required  disabled={this.props.isDisabled}/>
                                </div>
                            </div>
                            <div className="row mb-3">            
                                <label htmlFor="inputFirstDayWeek" className="col-sm-3 col-form-label col-form-label-sm">First Day of Week</label>
                                <div className="col-sm-3">
                                    <select className="form-select form-select-sm" name="firstDayWeek" value={this.props.data.firstDayWeek} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Monday" defaultValue>Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                        <option value="Saturday">Saturday</option>
                                        <option value="Sunday">Sunday</option>
                                    </select>                
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputHourDay" className="col-sm-4 col-form-label col-form-label-sm">Average Hours Per Day</label>
                                <div className="col-sm-2">
                                    <input type="number" name="averageHoursPerDay" value={this.props.data.averageHoursPerDay} onChange={this.props.onChangeEdit} className="form-control form-control-sm" id="inputHourDay" min="0" max="24" step="0.5" required disabled={this.props.isDisabled}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputHoursWeek" className="col-sm-4 col-form-label col-form-label-sm">Average Hour Per Week</label>
                                <div className="col-sm-2">
                                    <input type="number" name="averageHourPerWeek" value={this.props.data.averageHourPerWeek} onChange={this.props.onChangeEdit} className="form-control form-control-sm" id="inputHoursWeek" min="0" max="168" step="8" required disabled={this.props.isDisabled}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputAvgDWeek" className="col-sm-4 col-form-label col-form-label-sm">Average Working Days Per Week</label>
                                <div className="col-sm-2">
                                    <input type="number" name="averageWorkingDaysPerWeek" value={this.props.data.averageWorkingDaysPerWeek} onChange={this.props.onChangeEdit} className="form-control form-control-sm" id="inputDaysKeek" min="0" max="7" step="1" required disabled={this.props.isDisabled}/>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputCrossMN" className="col-sm-4 col-form-label col-form-label-sm">Cross Midnight Allowed</label>
                                <div className="col-sm-2">
                                    <select className="form-select form-select-sm" name="crossMidnightAllowed" value={this.props.data.crossMidnightAllowed} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="No" defaultValue>No</option>
                                        <option value="Yes">Yes</option>                    
                                    </select>                
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="imputStatus" className="col-sm-4 col-form-label col-form-label-sm">Status</label>
                                <div className="col-sm-2">
                                    <select className="form-select form-select-sm" name="crossMidnightAllowed" value={this.props.data.status} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Active" defaultValue>Active</option>
                                        <option value="Inactive">Inactive</option>                    
                                    </select>                
                                </div>
                            </div>
                        </div>

                        <div  className="col-lg-6">
                            <div className="row mb-3">
                                <label htmlFor="inputMonday" className="col-sm-3 col-form-label col-form-label-sm">Day</label>
                                <label className="col-sm-4 col-form-label col-form-label-sm">Category</label>
                                <label htmlFor="inputMondayDetails" className="col-sm-3 col-form-label col-form-label-sm">Details</label>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputMonday" className="col-sm-2 col-form-label col-form-label-sm">Monday</label>
                                <div className="col-sm-4">
                                    <select className="form-select form-select-sm" name="mondayCategory" value={this.props.data.mondayCategory} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Planned Hours">Planned Hours</option>
                                        <option value="Non-Working Day">Non-Working Day</option>
                                    </select>                
                                </div>
                                <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.props.onClickTwo(this.props.data.workScheduleDayDetailsMonday)}>details</button>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputTuesday" className="col-sm-2 col-form-label col-form-label-sm">Tuesday</label>
                                <div className="col-sm-4">
                                    <select className="form-select form-select-sm" name="tuesdayCategory" value={this.props.data.tuesdayCategory} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Planned Hours">Planned Hours</option>
                                        <option value="Non-Working Day">Non-Working Day</option>
                                    </select>                
                                </div>
                                <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.props.onClickTwo(this.props.data.workScheduleDayDetailsTuesday)}>details</button>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputWednesday" className="col-sm-2 col-form-label col-form-label-sm">Wednesday</label>
                                <div className="col-sm-4">
                                    <select className="form-select form-select-sm" name="wednesdayCategory" value={this.props.data.wednesdayCategory} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Planned Hours">Planned Hours</option>
                                        <option value="Non-Working Day">Non-Working Day</option>
                                    </select>                
                                </div>
                                <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.props.onClickTwo(this.props.data.workScheduleDayDetailsWednesday)}>details</button>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputThursday" className="col-sm-2 col-form-label col-form-label-sm">Thursday</label>
                                <div className="col-sm-4">
                                    <select className="form-select form-select-sm" name="thursdayCategory" value={this.props.data.thursdayCategory} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Planned Hours">Planned Hours</option>
                                        <option value="Non-Working Day">Non-Working Day</option>
                                    </select>                
                                </div>
                                <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.props.onClickTwo(this.props.data.workScheduleDayDetailsThursday)}>details</button>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputFriday" className="col-sm-2 col-form-label col-form-label-sm">Friday</label>
                                <div className="col-sm-4">
                                    <select className="form-select form-select-sm" name="fridayCategory" value={this.props.data.fridayCategory} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Planned Hours">Planned Hours</option>
                                        <option value="Non-Working Day">Non-Working Day</option>
                                    </select>                
                                </div>
                                <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.props.onClickTwo(this.props.data.workScheduleDayDetailsFriday)}>details</button>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputSaturday" className="col-sm-2 col-form-label col-form-label-sm">Saturday</label>
                                <div className="col-sm-4">
                                    <select className="form-select form-select-sm" name="saturdayCategory" value={this.props.data.saturdayCategory} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                        <option value="Non-Working Day">Non-Working Day</option>
                                        <option value="Planned Hours">Planned Hours</option>
                                    </select>                
                                </div>
                                <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.props.onClickTwo(this.props.data.workScheduleDayDetailsSaturday)}>details</button>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="inputSunday" className="col-sm-2 col-form-label col-form-label-sm">Sunday</label>
                                <div className="col-sm-4">
                                    <select className="form-select form-select-sm" name="sundayCategory" value={this.props.data.sundayCategory} onChange={this.props.onChangeEdit} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                    <option value="Non-Working Day">Non-Working Day</option>
                                    <option value="Planned Hours">Planned Hours</option>
                                    </select>                
                                </div>
                                <button type="button" className="col-sm-2 offset-sm-1 btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={(e) => this.props.onClickTwo(this.props.data.workScheduleDayDetailsSunday)}>details</button>
                            </div>
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

class WorkScheduleDayDetails extends Component {
    render () {
        return (
            <form className="row g-3">
                <div className="col-md-12">
                    <label htmlFor="inputEmail4" className="form-label">Day: {this.props.workScheduleDayDetails.day}</label>            
                </div>
                <div className="col-md-12">
                    <label htmlFor="inputPassword4" className="form-label">Category: {this.props.workScheduleDayDetails.category}</label>
                </div>
                <div className="col-md-12">
                    <label htmlFor="inputAddress" className="form-label">Segments</label>            
                </div>        
                <div className="col-md-1">
                    <label htmlFor="inputStartTime1" className="form-label">Start Time</label>            
                </div>
                <div className="col-md-1">
                    <label htmlFor="inputEndTime1" className="form-label">End Time</label>            
                </div>
                <div className="col-md-1">
                    <label htmlFor="inputDuration1" className="form-label">Duration</label>            
                </div>
                <div className="col-md-3">
                    <label htmlFor="inputCategory1" className="form-label">Category</label>            
                </div>
                <div className="col-md-6"></div>
                { this.props.workScheduleDayDetails.segments.map((item, index) => (
                    <div className="row" key={index}>
                        <div className="col-md-1">
                            <DatePicker
                                selected={item.startTime}
                                onChange={(e) => this.props.onChangeDetails(index, e, 0)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                className="form-control form-control-sm"
                                disabled={this.props.isDisabled}
                            />
                        </div>
                        <div className="col-md-1">
                            <DatePicker
                                selected={item.endTime}
                                onChange={(e) => this.props.onChangeDetails(index, e, 1)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                className="form-control form-control-sm"
                                disabled={this.props.isDisabled}
                            />
                        </div>
                        <div className="col-md-1">
                            <label className="form-label">{item.duration} min</label>
                        </div>
                        <div className="col-md-3">
                            <div className="col-sm-12">
                                <select className="form-select form-select-sm" name="dayCategory" value={item.dayCategory} onChange={(e) => this.props.onChangeDetails(index, e, 3)} aria-label=".form-select-sm example" required disabled={this.props.isDisabled}>
                                    <option value="Scheduled Working time">Scheduled Working time</option>
                                    <option value="Scheduled Unpaid Break">Scheduled Unpaid Break</option>
                                </select>                
                            </div>
                        </div>
                        { !this.props.isDisabled &&
                        <div className="col-md-1">            
                            <FontAwesomeIcon icon="plus-circle" type="button" onClick={this.props.onAddItem} />
                            {index === 0 ? (
                                <span></span>
                            ) : (
                                <span> <FontAwesomeIcon icon="trash" type="button" onClick={(e)=>this.props.onRemoveItem(index, e)} /></span>
                            )}
                            
                        </div> 
                        }
                    </div>
                ))}
                <div className="col-12">
                    
                </div>
            </form>
        )        
    }
}

const condition = authUser =>
  authUser && authUser.role === ROLES.ADMIN;

export default compose(
  withAuthorization(condition),
  withFirebase,
)(WorkSchedule);