import React, { Component } from "react";

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/button';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const INITIAL_STATE = {  
  end: new Date(),
  start: new Date(),
  loading: false,
};

export default class ModalForm extends Component {

  constructor(props) {
    super(props);
    
    this.state = {          
      ...INITIAL_STATE
    };
  }

  handleChange = (e) => this.setState({name: e.target.value})

  render(){
    return(
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.closeModal}
      >
      <Modal.Header closeButton>
        <Modal.Title>Registrar Nuevo Evento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="form-row">
            <div className="form-group col-md-12">
              <label className="form-label form-label-sm" htmlFor="inputEvent4">Event</label>
              <input type="event" className="form-control form-control-sm" id="inputEvent4" placeholder="Appointment with Peter Parker" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-6">                            
                <DatePicker dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.state.start} onChange={date => this.setState({ start: date })} required/>              
            </div>
            <div className="form-group col-md-6">                            
                <DatePicker dateFormat="dd MMMM, yyyy" className="form-control form-control-sm" selected={this.state.end} onChange={date => this.setState({ end: date })} required/>              
            </div>
            <div className="form-group col-md-2">              
                <DatePicker
                    selected={this.state.startTime}
                    onChange={time => this.setState({ startTime: time })}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="form-control form-control-sm"                  
                />              
            </div>
            <div className="form-group col-md-2">              
                <DatePicker
                    selected={this.state.endTime}
                    onChange={time => this.setState({ endTime: time })}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="form-control form-control-sm"                  
                />              
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-md-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="gridCheck" />
                <label className="form-check-label" htmlFor="gridCheck">
                  all day
                </label>
              </div>            
            </div>
            <div className="form-group col-md-8">              
              <select id="inputState" className="form-control form-control-sm">
                <option selected>Not Repeated</option>
                <option>Every Day</option>
                <option>Every Week on Monday</option>
                <option>Every Month on 2nd Monday</option>
                <option>Every Year on  March 17</option>
              </select>           
            </div>
          </div>
          <div className="form-row">            
            <div className="form-group col-md-12">
              <label htmlFor="exampleFormControlTextarea1">Description</label>
              <textarea className="form-control form-control-sm" id="exampleFormControlTextarea1" rows="2"></textarea>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Sign in</button>
        </form>
      </Modal.Body>
      <Modal.Footer>
          <Button variant="primary" type="submit" onClick={() => this.props.handleSubmit(this.state.name)}>
              Submit
          </Button>
      </Modal.Footer>
    </Modal>
    )
  }
}