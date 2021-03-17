import React, { Component } from "react";

import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/button'

export default class ModalForm extends Component {

  state={ name: null }

  handleChange = (e) => this.setState({name: e.target.value})

  render(){
    return(
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.closeModal}
      >
      <Modal.Header closeButton>
        <Modal.Title>Modal Form Title</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <h1>hola</h1>
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