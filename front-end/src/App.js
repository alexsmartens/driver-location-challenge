import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Form, ControlLabel, FormGroup, InputGroup, FormControl, Button, DropdownButton, MenuItem, ButtonToolbar, ButtonGroup , Alert, Label, Badge, Glyphicon} from 'react-bootstrap';
import {LineChart, ComposedChart, ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList} from 'recharts';
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';



class App extends Component {
  constructor() {
    super();
    
    this.state = {
      dropdownOpen: false,
      driver_location: null,
      driver_path: [],
      legs: null,
      legs_dict: {},
      stops: null,

      alert_info: {status: false,
                   type: "warning",
                   reason: "",
                   message: ""
                  },

      // New driver's location
      driver_loc_legProgress_new: '',
      driver_loc_activeLegID_new: null,
    };

    this.backEndUrl = "http://localhost:8080/"
    this.pointOverlapDict = {}
    this.iCheckFormatLabel = 0
    this.renderDropdownButton = this.renderDropdownButton.bind(this)
    this._onPostDriverButtonPressed = this._onPostDriverButtonPressed.bind(this)
    this.resetErrorMessage = this.resetErrorMessage.bind(this)
    this.setInputNumberErrorMessage = this.setInputNumberErrorMessage.bind(this)
    this._onLegDropdownButtonPressed = this._onLegDropdownButtonPressed.bind(this)
    this.computePath = this.computePath.bind(this)
  }


  resetErrorMessage(full_reset=false){
    // Reset of the error mesage
    if (full_reset){
      this.setState({alert_info: {status: false,
        type: "warning",
        reason: "",
        message: ""}})
    } else{
      this.setState({alert_info: {status: false,
        type: this.state.alert_info["type"],
        reason: this.state.alert_info["reason"],
        message: this.state.alert_info["message"]}})
    }
  }


  setInputNumberErrorMessage(){
    this.setState({alert_info: {status: true,
      type: "warning",
      reason: "inputNum",
      message: "Leg progress is an integer in [0, 100]"}})
  }


  getData(url = ``) {
      return fetch(url, {
          method: "GET", 
          dataType: 'json'
      }) 
  }


  postData(url = ``, data = {}) {
    console.log(JSON.stringify(data))
    return fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
      },
        body: JSON.stringify(data)
    }) 
  }


  renderDropdownButton(title, i) {
    return (
        <MenuItem 
          key={"key_" + title}
          onSelect={(evtKey, evt) => {
            this.setState({driver_loc_activeLegID_new: evt.target.innerText})
          }}
        >{title}</MenuItem>
    );
  }


  // Convert a list of dictionaries to a dictionary of dictionaries with the specified key values
  convert_list_to_dict(list_of_dicts, id){
    var new_dict = {}
    for (var i = 0; i < list_of_dicts.length; i++) {
      var dict_specs = {}
      for (var key in list_of_dicts[i]) {
        if (key !== id){
          dict_specs[key] = list_of_dicts[i][key]
        }
      }
      dict_specs["isMenuItemActive"] = false
      new_dict[list_of_dicts[i][id]] = dict_specs
    }
    return new_dict
  }


  _onGetLegsButtonPressed(){
    this.resetErrorMessage()

    this.getData(this.backEndUrl + "legs")
    .then(data => data.json())
    .then(data => {
      this.setState({legs: data["legs"]})

      var legs_dict = this.convert_list_to_dict(this.state.legs, "legID")
      this.setState({legs_dict: legs_dict})
    }) 
    .catch(error => {
      this.setState({alert_info: {status: true,
        type: "danger",
        reason: "newLegID",
        message: error["message"]}})
      console.error(error)
    })
  }


  _onGetStopsButtonPressed(){
    this.resetErrorMessage()

    this.getData(this.backEndUrl + "stops")
    .then(data => data.json())
    .then(data => {
      this.setState({stops: data["stops"]})

      // Update driver's location
      if (this.state.driver_location !== null) this.computePath()
    }) 
    .catch(error => {
      this.setState({alert_info: {status: true,
        type: "danger",
        reason: "newLegID",
        message: error["message"]}})
      console.error(error)
    })
  }


  _onGetDriverButtonPressed(){
    this.resetErrorMessage()

    this.getData(this.backEndUrl + "driver")
    .then(data => data.json())
    .then(data => {
      this.setState({driver_location: data["Driver’s current position"]})

      // Update driver's location
      if (this.state.stops !== null) this.computePath()
    }) 
    .catch(error => {
      this.setState({alert_info: {status: true,
        type: "danger",
        reason: "newLegID",
        message: error["message"]}})
      console.error(error)
    })
  }


  _onNewProgressValueChanged(newVal){
    var legProgress_new
    var txt = newVal.target.value
    this.resetErrorMessage()
    
    // Handle input with errors
    if (txt === ''){
      legProgress_new = ''
    }
    else if (Number.isNaN(parseInt(txt))){
      legProgress_new = ''
      this.setInputNumberErrorMessage()
    } else if (parseInt(txt).toString() !== txt){
      legProgress_new = parseInt(txt)
      this.setInputNumberErrorMessage()
    } else if (parseInt(newVal.target.value) < 0){
      legProgress_new = 0
      this.setInputNumberErrorMessage()
    } else if (parseInt(newVal.target.value) > 100){
      legProgress_new = 100
      this.setInputNumberErrorMessage()
    } else {
      legProgress_new = parseInt(txt)
    }

    // Set the proper value to new leg progress
    this.setState({driver_loc_legProgress_new: legProgress_new})
  }


  _onPostDriverButtonPressed(){
    this.resetErrorMessage()

    if (this.state.driver_loc_legProgress_new !== '' && this.state.driver_loc_activeLegID_new !== null){
      var new_driver_location = {"Driver’s current position":
        {
          "activeLegID": this.state.driver_loc_activeLegID_new,
          "legProgress": this.state.driver_loc_legProgress_new
        }
      }
      this.postData(this.backEndUrl + "driver", new_driver_location)
      .then(data => data.json())
      .then(data => {
        this.setState({driver_location: data["Driver’s current position"]})

      // Update driver's location
      if (this.state.driver_location !== null && this.state.stops !== null) this.computePath()
      }) 
      .catch(error => {
        this.setState({alert_info: {status: true,
          type: "danger",
          reason: "newLegID",
          message: error["message"]}})
        console.error(error)
      })
    } else {
      this.setState({alert_info: {status: true,
                                  type: "warning",
                                  reason: "postLoc",
                                  message: "New leg progress and ID should be specified first"}})
    }
  }


  _onLegDropdownButtonPressed(){
    this.resetErrorMessage()
    if (this.state.legs == null || this.state.legs.length === 0){
      this.setState({alert_info: {status: true,
        type: "warning",
        reason: "newLegID",
        message: "There is no leg ID data available, get leg IDs from the server first"}})
    }
  }



  formatFigureLabel(labelData){
    // The figure is rendered two times: (1) animation; (2) static figure
    if (this.iCheckFormatLabel > this.state.stops.length - 1){
      this.iCheckFormatLabel = 0
      this.pointOverlapDict = {}
    }
      this.iCheckFormatLabel +=1

      var thisPointKey = parseInt(labelData.x).toString() + parseInt(labelData.y).toString()

      // Handle overlapping lables
      var overlapDeltaX = 0
      var overlapDeltaY = 0
      if (thisPointKey in this.pointOverlapDict){

        this.pointOverlapDict[thisPointKey] += 1
        if (this.pointOverlapDict[thisPointKey] === 2){
          overlapDeltaY = 2 * labelData.offset
          overlapDeltaX = 2 * labelData.offset
        } else if (this.pointOverlapDict[thisPointKey] === 3){
          overlapDeltaY = labelData.offset + 2*labelData.height
        } else if (this.pointOverlapDict[thisPointKey] === 4){
          overlapDeltaY = 2 * labelData.offset
          overlapDeltaX = -2 * labelData.offset
        }
      } else {
        this.pointOverlapDict[thisPointKey] = 1
      }

      return <text x={labelData.x + labelData.offset + overlapDeltaX} y={labelData.y - labelData.offset + overlapDeltaY}  textAnchor="middle" dominantBaseline="middle">
              {labelData.value}
             </text>
  }


  // Compute driver's path
  computePath(){
    var driver_path = []
    for  (var i=0; i < this.state.stops.length; i++){
      driver_path.push({
                          "name": this.state.stops[i]["name"],
                          "x": this.state.stops[i]["x"],
                          "y": this.state.stops[i]["y"],
                        })
      if (this.state.stops[i]["name"] === this.state.driver_location["activeLegID"][0]){
        break
      }
    }
   
    // Compute driver's current position
    var leg_progress = parseInt(this.state.driver_location["legProgress"]) / 100
    var delta_x = this.state.stops[i+1]["x"] - this.state.stops[i]["x"]
    var delta_y = this.state.stops[i+1]["y"] - this.state.stops[i]["y"]
    var x = delta_x * leg_progress + this.state.stops[i]["x"]
    var y = delta_y * leg_progress + this.state.stops[i]["y"]

    driver_path.push({
      "name": "loc",
      "x": x,
      "y": y,
    })

    // Update driver's path
    this.setState({driver_path: driver_path})
  }


  // Potential feature: as of now, needs some debuging due to the potential bug in Recharts library 
  // The bug is reported in this thread: https://github.com/recharts/recharts/issues/1620
  // renderTooltip(data){
  //   if (data.payload != null) {
  //     if (data.payload[0] != null) {
  //       const newPayload = [
  //         {
  //           name: 'Name',
  //           value: data.payload[0].payload.name,
  //         },
  //         {
  //           name: 'x',
  //           value: data.payload[0].payload.x,
  //         },
  //         {
  //           name: 'y',
  //           value: data.payload[0].payload.y,
  //         },
  //       ];

  //       return <DefaultTooltipContent {...data} payload={newPayload} />
  //     }
  //   }
  // }

  

  render() {
    return (

      <div className="App">

          {this.state.alert_info["status"] ?
            <Alert bsStyle={this.state.alert_info["type"]}>
              <strong>{this.state.alert_info["type"] === "warning"? "Holy guacamole! " : "Oh snap! "}</strong> 
              {this.state.alert_info["message"]}
            </Alert> :
            null
          }
         

        <h1>Driver Location Challenge</h1>



        <ButtonToolbar style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100px'}}>
          <Button  style={{width: 150, margin: 5}}  variant="flat" size="xxl" onClick={() => this._onGetLegsButtonPressed()}>
            Get legs {this.state.legs == null ? <Glyphicon glyph="glyphicon glyphicon-save" /> : <Glyphicon glyph="glyphicon glyphicon-saved" />}
          </Button>

          <Button  style={{width: 150, margin: 5}}  variant="flat" size="xxl" onClick={() => this._onGetStopsButtonPressed()}>
            Get stops {this.state.stops == null ? <Glyphicon glyph="glyphicon glyphicon-save" /> : <Glyphicon glyph="glyphicon glyphicon-saved" />}
          </Button>

          <Button style={{width: 150, margin: 5}} variant="flat" size="xxl" onClick={() => this._onGetDriverButtonPressed()}>
            Get driver location {this.state.driver_location == null ? <Glyphicon glyph="glyphicon glyphicon-save" /> : <Glyphicon glyph="glyphicon glyphicon-saved" />}
          </Button>
        </ButtonToolbar>



        <Form componentClass="fieldset" inline>
        
          <FormGroup>

            <ControlLabel bsStyle="default" style={{marginRight: 10}}>New Driver's Location</ControlLabel>

            <InputGroup>
              <FormControl
                type="text"
                value={this.state.driver_loc_legProgress_new}
                placeholder="Enter new progress, %"
                onChange={(newVal) => this._onNewProgressValueChanged(newVal)}
              />

              <DropdownButton
                style={{width: 100}} 
                componentClass={InputGroup.Button}
                id="dropdown_new_leg_ID"
                title={this.state.driver_loc_activeLegID_new == null ? "New leg ID" : this.state.driver_loc_activeLegID_new}
                onToggle={() => this._onLegDropdownButtonPressed()}
              >
                {Object.keys(this.state.legs_dict).map(this.renderDropdownButton)}
              </DropdownButton>
            </InputGroup>
          </FormGroup>

          <Button style={{marginLeft: 10}} onClick={() => this._onPostDriverButtonPressed()}>
            Post location
          </Button>

        </Form>



        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginTop: 20}}>
          <h4><Label>City map</Label></h4>
        </div>

        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>

          <ComposedChart width={900} height={900} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
            <CartesianGrid />
            <XAxis dataKey={'x'} type="number" name='x' domain={[0, 200]}/>
            <YAxis dataKey={'y'} type="number" name='y' domain={[0, 200]}/>
            <Scatter name='stops' data={this.state.stops} fill='#8884d8' shape="cross" fillOpacity={0.7}>
              <LabelList dataKey="name" position="top" content={(labelData) => this.formatFigureLabel(labelData)}/>
            </Scatter>
            <Line name="Driver's path" dataKey="y" data={this.state.driver_path} fillOpacity={0.7} dot={false}/>
            <Scatter name='Driver location' data={this.state.driver_path.length ===0 ? null : [this.state.driver_path[this.state.driver_path.length-1]]} fill='#FF4500' shape="star" fillOpacity={0.95}/>
            {/* <Tooltip cursor={{strokeDasharray: '3 3'}} content={(data) => this.renderTooltip(data)}/> */}
            {/* <Tooltip content={({payload}) => (<div>{JSON.stringify(payload[0])}</div>)} /> */}
            <Legend align="center" iconSize={7}/>
          </ComposedChart>
        </div>

      </div>
    );
  }
}

export default App;
