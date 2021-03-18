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
    item: {
        end: new Date(),
        start: new Date(),
        title: "",
        description: "",
        frecuency:"Not Repeated",
        allDay: true,
    }
}

class EventsCalendar extends Component {
    constructor (props) {
        super(props)
        this.state = { ...INITIAL_STATE,
            myEventsList: [] }
        this.handleSelect = this.handleSelect.bind(this);
        this.eventDetails = this.eventDetails.bind(this);
    }

    // on component open
    componentDidMount = () => {
        this.props.firebase.agenda()
            .onSnapshot(
                querySnapshot => {
                  const newEntities = [];
                  querySnapshot.forEach(doc => {
                    const entity = doc.data()
                    entity.id = doc.id
                    entity.start = doc.data().start.toDate();
                    entity.end = doc.data().end.toDate();
                    newEntities.push(entity);
                    });
                  
                  this.setState({ myEventsList: newEntities});
                },
                error => {
                    console.log(error);
                }
              )
    }

    componentWillUnmount = () => {
        this.props.firebase.agenda();
    }

    openModal = () => this.setState({ isOpen: true });
    closeModal = () => {
        this.setState({ ...INITIAL_STATE })
    };

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
        console.log(event)
        this.setState({ showDetais: true, edit: false, item:event, isOpen: true });
    }

    // handle changes in form values
    onChange = event => {        
        this.setState({ [event.target.name]: event.target.value });
    };
    
    // Handle changes in allDay Checkbox  
    onChangeCheckbox = event => {        
        this.setState({ [event.target.name]: event.target.checked });
    };

    // Handle changes in datepickers
    onChangeDates = (date, name) => {
        this.setState({ [name]: date });
    };

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
        
        self.state.myEventsList.forEach(function (arrayItem) {            
            if ((data.start >= arrayItem.start && data.start < arrayItem.end) || (data.end >= arrayItem.start && data.end < arrayItem.end)) {
                console.log("The dates selectes are al ready reserved.")
                self.setState({ error: "The selected dates are already reserved.", loading:false });
                return
            }
        });
        
        /*
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
        */
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
                            frecuency={this.state.frecuency} description={this.state.description}
                            error={this.state.error} onSubmit={this.onSubmit}
                        />
                        ) :(
                        <EventFormEdit  data={this.state.item}
                            onChange={this.onChange} onChangeCheckbox={this.onChangeCheckbox}
                            onChangeDates={this.onChangeDates}
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
            <form onSubmit={this.props.onSubmit}>
                <div className="form-row">
                    <div className="form-group col-md-12">
                        <label className="form-label form-label-sm" htmlFor="inputEvent4">Event</label>
                        <input type="event" className="form-control form-control-sm" id="inputEvent4" name="title" value={this.props.data.title} onChange={this.props.onChange} placeholder="Appointment with Peter Parker" required disabled />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-6">                            
                        <DatePicker dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.props.data.start} onChange={date => this.props.onChangeDates(date, "start")} required disabled />              
                    </div>
                    
                    { this.props.data.allDay &&
                    <div className="form-group col-md-6">                            
                        <DatePicker dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.props.data.end} onChange={date => this.props.onChangeDates(date, "end")} required disabled />              
                    </div>
                    }
                    
                    { !this.props.data.allDay &&
                    <>                    
                    <div className="form-group col col-md-3">
                        <DatePicker
                            selected={this.props.data.start}
                            onChange={date => this.props.onChangeDates(date, "start")}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className="form-control form-control-sm"
                            disabled
                        />
                    </div>
                    <div className="form-group col col-md-3">
                        <DatePicker
                            selected={this.props.data.end}
                            onChange={date => this.props.onChangeDates(date, "end")}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="Time"
                            dateFormat="h:mm aa"
                            className="form-control form-control-sm"
                            disabled
                        />
                    </div>
                    </>
                    }
                </div>
                <div className="form-row">
                <div className="form-group col-md-12">
                    <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="gridCheck" name="allDay" value={this.props.data.allDay} onChange={this.props.onChangeCheckbox} disabled />
                    <label className="form-check-label" htmlFor="gridCheck">
                        all day
                    </label>
                    </div>            
                </div>
                <div className="form-group col-md-8">                
                    <select id="inputState" className="form-control form-control-sm" name="frecuency" value={this.props.data.frecuency} onChange={this.props.onChange} disabled >
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
                        <textarea className="form-control form-control-sm" id="exampleFormControlTextarea1" name="description" value={this.props.data.description} onChange={this.props.onChange} rows="2" disabled />
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

class EventForm extends Component {
    render () {
        return (
            <form onSubmit={this.props.onSubmit}>
                <div className="form-row">
                    <div className="form-group col-md-12">
                        <label className="form-label form-label-sm" htmlFor="inputEvent4">Event</label>
                        <input type="event" className="form-control form-control-sm" id="inputEvent4" name="title" value={this.props.title} onChange={this.props.onChange} placeholder="Appointment with Peter Parker" required />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group col-md-6">                            
                        <DatePicker dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.props.start} onChange={date => this.props.onChangeDates(date, "start")} required/>              
                    </div>
                    
                    { this.props.allDay &&
                    <div className="form-group col-md-6">                            
                        <DatePicker dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.props.end} onChange={date => this.props.onChangeDates(date, "end")} required/>              
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
                            timeIntervals={30}
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
                            timeIntervals={30}
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