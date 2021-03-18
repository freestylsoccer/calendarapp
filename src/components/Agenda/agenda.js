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
}

class EventsCalendar extends Component {
    constructor (props) {
        super(props)
        this.state = { ...INITIAL_STATE,
            myEventsList: [] }
        this.handleSelect = this.handleSelect.bind(this);        
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

    openModal = () => this.setState({ isOpen: true });
    closeModal = () => this.setState({ isOpen: false });
    
    onAddItem = (item) => {
        var joined = this.state.myEventsList.concat(item);
        this.setState({ myEventsList: joined })
      };

    handleSelect ({ start, end }) {
        console.log(start)
        console.log(end )
        if (start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0 && end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
            this.setState({ allDay: true, start: start, end: end, isOpen: true });
        }

        // this.setState({ isOpen: true });
        
        /*
        const title = window.prompt("New Event name");
        if (title) {
            var newEvent = {
                start: start,
                end: end,
                title: title
            }
            console.log(newEvent)
            this.onAddItem(newEvent);
        }
        */
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
        const { start, end, title, description, frecuency } = this.state;
        const data = {
            start, 
            end, 
            title, 
            description, 
            frecuency
        }

        console.log(data);
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

    render() {
        return (
            <>
            { this.state.loading === false ? (
                <div style={{height: '100vh', margin: '10px'}}>
                    { this.state.isOpen ? 
                    <ModalForm closeModal={this.closeModal} isOpen={this.state.isOpen} handleSubmit={this.handleSubmit}>
                        <EventForm start={this.state.start} end={this.state.end} 
                            onChange={this.onChange} allDay={this.state.allDay} onChangeCheckbox={this.onChangeCheckbox}
                            onChangeDates={this.onChangeDates} title={this.state.title}
                            frecuency={this.state.frecuency} description={this.state.description}
                            onSubmit={this.onSubmit}
                        />
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
                        onSelectEvent={event => alert(event.title)}
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

class EventForm extends Component {
    render () {
        return (
            <form onSubmit={this.props.onSubmit}>
                <div className="form-row">
                    <div className="form-group col-md-12">
                        <label className="form-label form-label-sm" htmlFor="inputEvent4">Event</label>
                        <input type="event" className="form-control form-control-sm" id="inputEvent4" name="title" value={this.props.title} onChange={this.props.onChange} placeholder="Appointment with Peter Parker" />
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