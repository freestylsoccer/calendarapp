import React, { Component } from "react";
import {
    Calendar,
    momentLocalizer,
  } from 'react-big-calendar'
import moment from "moment";
import ModalForm from '../Modal/Modal';


require('moment/locale/es.js');

const localizer = momentLocalizer(moment);
//array de eventos

class EventsCalendar extends Component {
    constructor (props) {
        super(props)
        this.state = {
            isOpen: false,
            myEventsList: [
                {
                    title: "today",
                    start: new Date('2021-03-05 10:22:00'),
                    end: new Date('2021-03-05 10:42:00')
                },
                {
                    title: "string",
                    start: new Date('2021-03-05 12:22:00'),
                    end: new Date('2021-03-05 13:42:00')
                }
            ]
        }
        this.handleSelect = this.handleSelect.bind(this);        
    }

    openModal = () => this.setState({ isOpen: true });
    closeModal = () => this.setState({ isOpen: false });
    // handleSubmit(name) => //some code

    onAddItem = (item) => {
        var joined = this.state.myEventsList.concat(item);
        this.setState({ myEventsList: joined })
      };

    handleSelect ({ start, end }) {
        console.log('clicked')
        console.log(start)
        console.log(end)
        this.setState({ isOpen: true });
        
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
    
    render() {
        return (
            <div style={{height: '100vh', margin: '10px'}}>                
                { this.state.isOpen ? 
                <ModalForm 
                    closeModal={this.closeModal} 
                    isOpen={this.state.isOpen} 
                    handleSubmit={this.handleSubmit}
                /> 
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
        );
  }
}

export default EventsCalendar;