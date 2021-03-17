import React from 'react'
import EventsCalendar from "./agenda";



class App extends React.Component {
  constructor () {
    super()
    this.state = {
      events2: []
    }
  }

  render () {    
    return (
      <div className="container-fluid">        
        <h1>Hello Dr Pofi</h1>        
        <EventsCalendar />
      </div>
      
    )
  }
}

export default App;