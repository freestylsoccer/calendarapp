import React, { Component } from "react";
import {
    Calendar,
    momentLocalizer,
  } from 'react-big-calendar'
import moment from "moment";
require('moment/locale/es.js');

const localizer = momentLocalizer(moment);
//array de eventos

class EventsCalendar extends Component {
    constructor (props) {
        super(props)
        this.state = {
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
        this.handleSelect = this.handleSelect.bind(this)
    }

    onAddItem = (item) => {
        var joined = this.state.myEventsList.concat(item);
        this.setState({ myEventsList: joined })
      };

    handleSelect ({ start, end }) {
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
    }
    
    render() {
        return (
            <div style={{height: '100vh', margin: '10px'}}>
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