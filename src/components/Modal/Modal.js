import React, { Component } from "react";
import Modal from 'react-bootstrap/Modal';

export default class ModalForm extends Component {

  handleChange = (e) => this.setState({name: e.target.value})

  render(){
    return(
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.closeModal}
      >
      <Modal.Header closeButton>
        <Modal.Title>New Event</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {this.props.children}
      </Modal.Body>
    </Modal>
    )
  }
}