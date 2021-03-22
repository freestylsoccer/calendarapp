import React, { Component } from "react";
import {
    Calendar,
    momentLocalizer,
  } from 'react-big-calendar'
import moment, { relativeTimeThreshold } from "moment";
import { withAuthorization } from '../Session';
import ModalForm from '../Modal/Modal';
import LoadingScreen from "../Loading/LoadingScreen";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

require('moment/locale/es.js');

const localizer = momentLocalizer(moment);
//array de eventos
const INITIAL_STATE = {
    end: new Date(),
    start: new Date(),
    title: "",
    description: "",
    frecuency:"Not Repeated",
    allDay: true,
    isOpen: false,
    loading: false,
    showDetais: false,    
    item: {
        end: new Date(),
        start: new Date(),
        title: "",
        description: "",
        frecuency:"Not Repeated",
        allDay: true,
    },
    originalItem: {},
}

class EventsCalendar extends Component {
    constructor (props) {
        super(props)
        this.state = { ...INITIAL_STATE,
            myEventsList: [],
            toExcludeDates: [],
            toExcludeTimes: [],
            excludeTime: []
         }
        this.handleSelect = this.handleSelect.bind(this);
        this.eventDetails = this.eventDetails.bind(this);
        this.onView = this.onView.bind(this);
        this.onNavigate = this.onNavigate.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    getEvents = (startDate, endDate) => {
        this.props.firebase.agenda()
            .where('start', '>=', startDate)
            .where('start', '<=', endDate)
            .onSnapshot(
                querySnapshot => {
                    const newEntities = [];                    
                    querySnapshot.forEach(doc => {
                        const entity = doc.data()
                        entity.id = doc.id
                        entity.start = doc.data().start.toDate();
                        entity.end = doc.data().end.toDate();                        
                        newEntities.push(entity);
                        // dates to exclude
                        var a = moment(entity.end);
                        var b = moment(entity.start);
                        
                        if (a.diff(b, 'hours') >= 23) {
                            this.getDates(entity.start, entity.end);                            
                        }
                        if (a.diff(b, 'hours') < 23) {
                            this.getTimes(entity.start, a.diff(b, 'hours'))
                        }
                    });
                     
                    this.setState({ myEventsList: newEntities });
                },
                error => {
                    console.log(error);
                }
            )
    }

    getTimes = function(startDate, h) {
        var hours = [],
        currentDate = startDate,
        addHours = function(hrs) {
            var date = new Date(this.valueOf());
            //console.log(date)
            date.setHours(date.getHours() + hrs);
            return date;
        },
        i = 1;
        while (i <= h) {
            hours.push(currentDate);
            this.setState({
                toExcludeTimes: [...this.state.toExcludeTimes, currentDate]
            })
            currentDate = addHours.call(currentDate, 1);            
            i+=1;
        }
        return hours;
    }

    // Returns an array of dates between the two dates
    getDates = function(startDate, endDate) {
        var dates = [],
        currentDate = startDate,
        addDays = function(days) {
          var date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };
        while (currentDate <= endDate) {
            dates.push(currentDate);
            this.setState({
                toExcludeDates: [...this.state.toExcludeDates, currentDate]
            })
            currentDate = addDays.call(currentDate, 1);
        }
        return dates;
    };

    // on component open
    componentDidMount = () => {
        let today = new Date();
        // console.log(today.getMonth()+1);
        // console.log(today.getFullYear());
        let startDate = new Date(today.getFullYear(), today.getMonth());
        let endDate =  moment(startDate).add(35, 'days');
        endDate = endDate._d;

        this.getEvents(startDate, endDate);
        
    }

    openModal = () => this.setState({ isOpen: true });
    closeModal = () => {
        this.setState({ ...INITIAL_STATE })
    };

    onView(view){
        // console.log('#### onView');
        // console.log('#### view=', view);    
    }
    onNavigate(date, view){
        // console.log('#### onNavigate');
        // console.log('#### date=', date);
        // console.log('#### view=', view);
        let startDate = new Date(date.getFullYear(), date.getMonth());
        let endDate =  moment(startDate).add(35, 'days');
        endDate = endDate._d;

        this.getEvents(startDate, endDate);
    }

    handleSelect ({ start, end }) {
        // console.log(start)
        // console.log(end)
        let range = false;
        if (start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0 && end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
            let some = moment(end).add(23, 'hours').add(59, 'minutes').add(59, 'seconds');
            end = some._d;
            range = true;
        }
        this.setState({ allDay: range, start: start, end: end, isOpen: true });
    }

    eventDetails (event) {        
        this.setState({ showDetais:true, edit:false, item:event, originalItem:event, isOpen:true });
    }

    // handle changes in form values
    onChange = event => {        
        this.setState({ [event.target.name]: event.target.value });
    };

    onChangeEdit = event => {        
        this.setState({
            ...this.state,
            item: { ...this.state.item, [event.target.name]: event.target.value },
        });        
      };
    
    // Handle changes in allDay Checkbox  
    onChangeCheckbox = event => {        
        this.setState({ [event.target.name]: event.target.checked });
    };

    onChangeCheckboxEdit = event => {      
        this.setState({
            ...this.state,
            item: { ...this.state.item, [event.target.name]: event.target.checked },
        });      
    };

    // Handle changes in datepickers
    onChangeDates = (date, name) => {        
        if (name === "start" && date > this.state.end) {            
            this.setState({ [name]: date, end: date });
        } else if (name === "end" && date < this.state.start) {            
            this.setState({ [name]: date, start: date });
        } else {
            this.setState({ [name]: date });
        }        
    };

    onChangeDatesEdit = (date, name) => {
        if (name === "start" && date > this.state.item.end) {            
            this.setState({ 
                ...this.state,
                item: { ...this.state.item, [name]: date, end: date },
            });
        } else if (name === "end" && date < this.state.item.start) {            
            this.setState({ 
                ...this.state,
                item: { ...this.state.item, [name]: date, start: date },
            });
        } else {
            this.setState({ 
                ...this.state,
                item: { ...this.state.item, [name]: date },
            });
        }
        
    };

    onEnableEdit = () => {
        this.setState({ edit: true });
    }

    onDisableEdit = () => {
        let clone = this.state.originalItem;
        this.setState({ item:clone, edit:false });
    }

    onSubmit = event => {
        event.preventDefault();
        var self = this;
        self.setState({ loading: true });
        const { start, end, title, description, allDay, frecuency } = this.state;
        const data = {
            start, 
            end, 
            title, 
            description, 
            frecuency,
            allDay
        }
        /*
        self.state.myEventsList.forEach(function (arrayItem) {            
            if ((data.start >= arrayItem.start && data.start < arrayItem.end) || (data.end >= arrayItem.start && data.end < arrayItem.end)) {
                console.log("The dates selectes are al ready reserved.")
                self.setState({ error: "The selected dates are already reserved.", loading:false });
                return
            }
        });
        */
        
        this.props.firebase.agenda()
            .add(data)
            .then(() => {                            
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

    setMinTime = () => {
        var min = null
        if (this.state.start.getHours() < 8) {            
            min = new Date(this.state.start.getFullYear(), this.state.start.getMonth(), this.state.start.getDay(), 8)
        } else {
            min = this.state.start;
        }
        return min
    }

    render() {
        
        return (
            <>
            { this.state.loading === false ? (
                <div style={{height: '100vh', margin: '10px'}}>                    
                    { this.state.success &&
                        <div className="alert alert-success" role="alert">
                            { this.state.success }
                        </div> 
                    }
                    { this.state.isOpen ? 
                    <ModalForm closeModal={this.closeModal} isOpen={this.state.isOpen}>                        
                        { this.state.showDetais === false ? (
                        <EventForm start={this.state.start} end={this.state.end} 
                            onChange={this.onChange} allDay={this.state.allDay} onChangeCheckbox={this.onChangeCheckbox}
                            onChangeDates={this.onChangeDates} title={this.state.title}
                            toExcludeDates={this.state.toExcludeDates} excludeTime={this.state.excludeTime} 
                            filterTimes={this.filterTimes} setMinTime={this.setMinTime}
                            frecuency={this.state.frecuency} description={this.state.description}
                            error={this.state.error} onSubmit={this.onSubmit}
                        />
                        ) :(
                        <EventFormEdit  data={this.state.item}
                            onChangeEdit={this.onChangeEdit} onChangeCheckboxEdit={this.onChangeCheckboxEdit}
                            onChangeDatesEdit={this.onChangeDatesEdit} edit={this.state.edit}
                            onEnableEdit={this.onEnableEdit} onDisableEdit={this.onDisableEdit}
                            error={this.state.error} onSubmit={this.onSubmit}
                        />
                        )
                        }
                    </ModalForm> 
                    : 
                    null 
                    }                    
                    <Calendar
                        selectable
                        localizer={localizer}
                        events={this.state.myEventsList}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={(event) => this.eventDetails(event)}
                        onSelectSlot={this.handleSelect}
                        titleAccessor='title'
                        onView={this.onView}
                        onNavigate={this.onNavigate}
                        messages={{
                                    next: "Sig.",
                                    previous: "Ant.",
                                    today: "Hoy",
                                    month: "Mes",
                                    week: "Semana",
                                    day: "Día"
                                }}
                    />
                </div>
            ) : (
                <LoadingScreen />
            )
            }
            </>
        );
  }
}

class EventFormEdit extends Component {
    render () {
        return (
            <>            
            { !this.props.edit &&
            <div className="row justify-content-start">
                <div className="col-12">
                    <button type="button" className="btn btn-link" onClick={this.props.onEnableEdit}>Edit</button>
                </div>
            </div>
            }
            
            <form onSubmit={this.props.onSubmit}>
                <div className="form-row">
                    <div className="form-group col-md-12">
                        <label className="form-label form-label-sm" htmlFor="inputEvent4">Title</label>
                        <input type="event" className="form-control form-control-sm" id="inputEvent4" name="title" value={this.props.data.title} onChange={this.props.onChangeEdit} placeholder="Appointment with Peter Parker" required disabled={!this.props.edit} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-6">                            
                        <DatePicker dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.props.data.start} onChange={date => this.props.onChangeDatesEdit(date, "start")} required disabled={!this.props.edit} />              
                    </div>
                    
                    { this.props.data.allDay &&
                    <div className="form-group col-md-6">                            
                        <DatePicker dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.props.data.end} onChange={date => this.props.onChangeDatesEdit(date, "end")} required disabled={!this.props.edit} />              
                    </div>
                    }
                    
                    { !this.props.data.allDay &&
                    <>                    
                    <div className="form-group col col-md-3">
                        <DatePicker
                            selected={this.props.data.start}
                            onChange={date => this.props.onChangeDatesEdit(date, "start")}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className="form-control form-control-sm"
                            disabled={!this.props.edit}
                        />
                    </div>
                    <div className="form-group col col-md-3">
                        <DatePicker
                            selected={this.props.data.end}
                            onChange={date => this.props.onChangeDatesEdit(date, "end")}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className="form-control form-control-sm"
                            disabled={!this.props.edit}
                        />
                    </div>
                    </>
                    }
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12">
                        <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="gridCheck" name="allDay" defaultChecked={this.props.data.allDay} value={this.props.data.allDay} onChange={this.props.onChangeCheckbox} disabled={!this.props.edit} />
                        <label className="form-check-label" htmlFor="gridCheck">
                            all day
                        </label>
                        </div>            
                    </div>
                    <div className="form-group col-md-8">                
                        <select id="inputState" className="form-control form-control-sm" name="frecuency" value={this.props.data.frecuency} onChange={this.props.onChangeEdit} disabled={!this.props.edit} >
                        <option value="Not Repeated">Not Repeated</option>
                        <option value="Every Day">Every Day</option>
                        <option value="Every Week on Monday">Every Week on Monday</option>
                        <option value="Every Month on 2nd Monday">Every Month on 2nd Monday</option>
                        <option value="Every Year on  March 17">Every Year on  March 17</option>
                        </select>           
                    </div>
                </div>
                <div className="form-row">            
                    <div className="form-group col-md-12">
                        <label htmlFor="exampleFormControlTextarea1">Description</label>
                        <textarea className="form-control form-control-sm" id="exampleFormControlTextarea1" name="description" value={this.props.data.description} onChange={this.props.onChangeEdit} rows="2" disabled={!this.props.edit} />
                    </div>
                </div>
                { this.props.error &&
                    <div className="alert alert-danger" role="alert">
                        { this.props.error }
                    </div> 
                }
                <hr/>
                { this.props.edit &&
                <div className="row justify-content-end">
                    <div className="buttons">
                        <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>                                        
                        <button type="button" className="btn btn-danger btn-sm" onClick={this.props.onDisableEdit} >Cancel</button>
                    </div>                    
                </div>
                }                
            </form>
            </>
        )
    }
}

class EventForm extends Component {
    render () {        
        console.log(this.props.excludeTime)
        return (
            <form onSubmit={this.props.onSubmit}>
                <div className="form-row">
                    <div className="form-group col-md-12">
                        <label className="form-label form-label-sm" htmlFor="inputEvent4">Title</label>
                        <input type="event" className="form-control form-control-sm" id="inputEvent4" name="title" value={this.props.title} onChange={this.props.onChange} placeholder="Appointment with Peter Parker" required />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-6">                            
                        <DatePicker excludeDates={this.props.toExcludeDates} dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.props.start} onChange={date => this.props.onChangeDates(date, "start")} required/>              
                    </div>
                    
                    { this.props.allDay &&
                    <div className="form-group col-md-6">                            
                        <DatePicker minDate={new Date()} excludeDates={this.props.toExcludeDates} dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.props.end} onChange={date => this.props.onChangeDates(date, "end")} required/>              
                    </div>
                    }
                    
                    { !this.props.allDay &&
                    <>                    
                    <div className="form-group col col-md-3">
                        <DatePicker
                            selected={this.props.start}
                            onChange={date => this.props.onChangeDates(date, "start")}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={60}
                            excludeTimes={this.props.excludeTime}
                            minTime={this.props.setMinTime()}
                            maxTime={new Date(this.props.start.getFullYear(), this.props.start.getMonth(), this.props.start.getDay(), 19)}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className="form-control form-control-sm"
                        />
                    </div>
                    <div className="form-group col col-md-3">
                        <DatePicker
                            selected={this.props.end}
                            onChange={date => this.props.onChangeDates(date, "end")}                            
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={60}
                            excludeTimes={this.props.toExcludeTimes}
                            minTime={new Date(this.props.start.getFullYear(), this.props.start.getMonth(), this.props.start.getDay(), 9)}
                            maxTime={new Date(this.props.start.getFullYear(), this.props.start.getMonth(), this.props.start.getDay(), 20)}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className="form-control form-control-sm"
                        />
                    </div>
                    </>
                    }
                </div>
                <div className="form-row">
                    <div className="form-group col-md-12">
                        <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="gridCheck" name="allDay" defaultChecked={this.props.allDay} value={this.props.allDay} onChange={this.props.onChangeCheckbox} />
                        <label className="form-check-label" htmlFor="gridCheck">
                            all day
                        </label>
                        </div>            
                    </div>
                    <div className="form-group col-md-8">                
                        <select id="inputState" className="form-control form-control-sm" name="frecuency" value={this.props.frecuency} onChange={this.props.onChange}>
                        <option value="Not Repeated">Not Repeated</option>
                        <option value="Every Day">Every Day</option>
                        <option value="Every Week on Monday">Every Week on Monday</option>
                        <option value="Every Month on 2nd Monday">Every Month on 2nd Monday</option>
                        <option value="Every Year on  March 17">Every Year on  March 17</option>
                        </select>           
                    </div>
                </div>
                <div className="form-row">            
                    <div className="form-group col-md-12">
                        <label htmlFor="exampleFormControlTextarea1">Description</label>
                        <textarea className="form-control form-control-sm" id="exampleFormControlTextarea1" name="description" value={this.props.description} onChange={this.props.onChange} rows="2" />
                    </div>
                </div>
                { this.props.error &&
                    <div className="alert alert-danger" role="alert">
                        { this.props.error }
                    </div> 
                }
                <hr/>
                <div className="row justify-content-end">
                    <div className="col-md-3">
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>                    
                </div>                
            </form>
        )
    }
}

const condition = authUser => !!authUser;
 
export default withAuthorization(condition)(EventsCalendar);