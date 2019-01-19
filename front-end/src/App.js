import React, { Component } from 'react';
import './App.css';
import { Form, ControlLabel, FormGroup, FormControl, Button, DropdownButton, MenuItem, ButtonToolbar, Alert, Label, Glyphicon} from 'react-bootstrap';
import {ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Legend, LabelList} from 'recharts';
// import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';

const Handle = Slider.Handle;


class App extends Component {
  constructor() {
    super();
    
    this.state = {
      driver_location: null,
      driver_path: [],
      legs: null,
      legs_dict: {},
      stops: null,
      stops_dict: {},
      // Alert/error message
      alert_info: {status: false,
        type: "warning",
        reason: "",
        message: ""
        },       
      // Bonus 1: Bonus driver info
      bonus_driver_location: null,
      bonus_driver_x_new: '',
      bonus_driver_y_new: '',
      path_to_complete: null,
      // Bonus 2: Driver path info
      bonus2_time_complete_all_legs: null,
      bonus2_time_complete: null,
      // Bonus 3: New driver's location
      driver_loc_activeLegID_new: null,
      sliderVal: null,
      newDriverLoc: null,
    };

    this.backEndUrl = "http://localhost:8080/"

    // Store info about overlaping stops
    this.pointOverlapDict = {}
    this.iCheckFormatLabel = 0

    this.renderDropdownButton = this.renderDropdownButton.bind(this)
    this._onPutDriverButtonPressed = this._onPutDriverButtonPressed.bind(this)
    this.resetErrorMessage = this.resetErrorMessage.bind(this)
    this.setInputNumberErrorMessage = this.setInputNumberErrorMessage.bind(this)
    this._onLegDropdownButtonPressed = this._onLegDropdownButtonPressed.bind(this)
    this.computePath = this.computePath.bind(this)
    this._onBonusDriverCoordinatesChanged = this._onBonusDriverCoordinatesChanged.bind(this)
    this._onPutBonusDriverButtonPressed = this._onPutBonusDriverButtonPressed.bind(this)
    this._onGetBonusDriverButtonPressed = this._onGetBonusDriverButtonPressed.bind(this)
    this.computeBonusRemainingPath = this.computeBonusRemainingPath.bind(this)
    this.computePathToComplete = this.computePathToComplete.bind(this)
    this._onSliderChange = this._onSliderChange.bind(this)
    this.computeNewDriverLocOnLegChanged = this.computeNewDriverLocOnLegChanged.bind(this)
  }


  // Handle alert/error messages
  setInputNumberErrorMessage(err_reason, err_msg){
    this.setState({alert_info: {status: true,
      type: "warning",
      reason: err_reason,
      message: err_msg}})
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


  // Parts 1 & 3: REST GET 
  getData(url = ``) {
      return fetch(url, {
          method: "GET", 
          dataType: 'json'
      }) 
  }
  // Part 7: REST PUT 
  putData(url = ``, data = {}) {
    return fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
      },
        body: JSON.stringify(data)
    }) 
  }


  // Part 4 & 5: Compute driver's current location and completed path
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

    this.setState({
      newDriverLoc : {
        "x": x,
        "y": y,
      },
      sliderVal: parseInt(this.state.driver_location["legProgress"]),
      driver_loc_activeLegID_new: this.state.driver_location["activeLegID"]
    })

    // Update driver's path
    this.setState({driver_path: driver_path})
  } 


  // Bonus 1: Compute the closest stop to the bonus driver and the remaining path from the closest stop to the final stop
  computeBonusRemainingPath(){
    var path_to_complete = []
    var x = this.state.bonus_driver_location["x"]
    var y = this.state.bonus_driver_location["y"]
    
    // Find the closest stop
    var min_i = 0
    var min = Infinity
    for (var i = 0; i < this.state.stops.length; i++ ){
      var dist = Math.sqrt(Math.pow(this.state.stops[i]["x"] - x, 2) + Math.pow(this.state.stops[i]["y"] - y, 2))
      if (dist < min){
        min = dist
        min_i = i
      }
    }

    // Compute the remaining path
    path_to_complete.push({
      "name": "loc",
      "x": x,
      "y": y,
    })
    for (i = min_i; i < this.state.stops.length; i++ ){
      path_to_complete.push({
        "name": this.state.stops[i]["name"],
        "x": this.state.stops[i]["x"],
        "y": this.state.stops[i]["y"],
      })
    }

    this.setState({path_to_complete: path_to_complete})
  }


  // Bonus 2: compute how long it will take the driver to complete the entire path (all of the legs) and 
  // how much time is left for the driver based on the current position
  computePathToComplete(){
    if (Object.keys(this.state.legs_dict).length !== 0  &&Object.keys(this.state.stops_dict).length !== 0 && this.state.driver_location !== null) {

      // Time required to complete all legs
      var time_complete_all_legs = 0
      // Time required to complete driver's remaining path
      var time_complete = 0
      
      // Append legs dictionary with start and stop locations and compute time required to drive from start to stop.
      // Also, compute times to complete driver's path and all legs
      var new_legs_dict = {}
      var is_passed_driver_leg = false

      for (var key in this.state.legs_dict) {
        var dict_specs = this.state.legs_dict[key]
        dict_specs["startStop_x"] = this.state.stops_dict[dict_specs["startStop"]]["x"]
        dict_specs["startStop_y"] = this.state.stops_dict[dict_specs["startStop"]]["y"]
        dict_specs["endStop_x"] = this.state.stops_dict[dict_specs["endStop"]]["x"]
        dict_specs["endStop_y"] = this.state.stops_dict[dict_specs["endStop"]]["y"]
        
        // Distance between subsequent stops
        var dist = Math.sqrt(Math.pow(dict_specs["endStop_x"] - dict_specs["startStop_x"], 2) + 
                            Math.pow(dict_specs["endStop_y"] - dict_specs["startStop_y"], 2))
        // Time required to drive from the start to the stop point
        dict_specs["time"] = dist / dict_specs["speedLimit"]

        // Update leg info
        new_legs_dict[key] = dict_specs

        // Update time to complete the entire path and the remaining path
        time_complete_all_legs += new_legs_dict[key]["time"]
        if (is_passed_driver_leg) time_complete += new_legs_dict[key]["time"]
        if (key === this.state.driver_location["activeLegID"]) is_passed_driver_leg = true
      }

      // Update time to complete the remaining path with the time to complete the current leg
      time_complete += new_legs_dict[this.state.driver_location["activeLegID"]]["time"] * (100 - parseInt(this.state.driver_location["legProgress"])) / 100
      
      this.setState({legs_dict: new_legs_dict,
                     bonus2_time_complete_all_legs: time_complete_all_legs,
                     bonus2_time_complete: time_complete
      })
    } else {
      this.setState({alert_info: {status: true,
        type: "warning",
        reason: "computePath",
        message: "Legs, stops and driver location are reqired for this feature to work"}})
    }
  }


  // Bonus 3: Compute new driver location
  computeNewDriverLocOnLegChanged(newLeg){
    if (this.state.legs_dict[newLeg]["startStop_x"] !== undefined){

      var start_x = this.state.legs_dict[newLeg]["startStop_x"]
      var start_y = this.state.legs_dict[newLeg]["startStop_y"]
      var end_x = this.state.legs_dict[newLeg]["endStop_x"]
      var end_y = this.state.legs_dict[newLeg]["endStop_y"]

      var delta_x = end_x - start_x
      var delta_y = end_y - start_y

      var new_driver_x = start_x + delta_x * this.state.sliderVal / 100
      var new_driver_y = start_y + delta_y * this.state.sliderVal / 100

      this.setState({newDriverLoc:{
                                    "x": new_driver_x,
                                    "y": new_driver_y,
                                  }
      })

    }    
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
      dict_specs["index"] = i
      new_dict[list_of_dicts[i][id]] = dict_specs
    }
    return new_dict
  }


  // Handle numerical input to be in specified range
  checkNumInput(txt, min, max, err_reason, err_msg){
    var val
    // Handle input with errors
    if (txt === ''){
      val = ''
    }
    else if (Number.isNaN(parseInt(txt))){
      val = ''
      this.setInputNumberErrorMessage(err_reason, err_msg)
    } else if (parseInt(txt).toString() !== txt){
      val = parseInt(txt)
      this.setInputNumberErrorMessage(err_reason, err_msg)
    } else if (parseInt(txt) < min){
      val = min
      this.setInputNumberErrorMessage(err_reason, err_msg)
    } else if (parseInt(txt) > max){
      val = max
      this.setInputNumberErrorMessage(err_reason, err_msg)
    } else {
      val = parseInt(txt)
    }

    return val
  }


  renderDropdownButton(title, i) {
    return (
        <MenuItem 
          key={"key_" + title}
          onSelect={(evtKey, evt) => {
            this.setState({driver_loc_activeLegID_new: evt.target.innerText})
            this.computeNewDriverLocOnLegChanged(evt.target.innerText)
          }}
        >{title}</MenuItem>
    )
  }


  formatFigureLabel(labelData){
    // The figure is rendered two times: (1) animation; (2) static figure
    if (this.iCheckFormatLabel > this.state.stops.length - 1){
      this.iCheckFormatLabel = 0
      this.pointOverlapDict = {}
    }
      this.iCheckFormatLabel +=1
      var thisPointKey = parseInt(labelData.x).toString() + parseInt(labelData.y).toString()

      // Handle overlapping stop lables
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


  _onGetLegsButtonPressed(){
    this.resetErrorMessage()

    this.getData(this.backEndUrl + "legs")
    .then(data => data.json())
    .then(data => {
      this.setState({legs: data["legs"]})

      var legs_dict = this.convert_list_to_dict(this.state.legs, "legID")
      this.setState({legs_dict: legs_dict})

      // Bonus 2: compute path time to complete
      if (Object.keys(this.state.stops_dict).length !== 0 && this.state.driver_location !== null) this.computePathToComplete()
    }) 
    .catch(error => {
      this.setState({alert_info: {status: true,
        type: "danger",
        reason: "GetLegs",
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

      var stops_dict = this.convert_list_to_dict(this.state.stops, "name")
      this.setState({stops_dict: stops_dict})

      // Update driver's location
      if (this.state.driver_location !== null) this.computePath()
      // Update bonus driver's remaining path
      if (this.state.bonus_driver_location !== null) this.computeBonusRemainingPath()

      // Bonus 2: compute path time to complete
      if (Object.keys(this.state.legs_dict).length !== 0 && this.state.driver_location !== null) this.computePathToComplete()
    }) 
    .catch(error => {
      this.setState({alert_info: {status: true,
        type: "danger",
        reason: "GetStops",
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

      // Bonus 2: compute path time to complete
      if (Object.keys(this.state.stops_dict).length !== 0 && Object.keys(this.state.legs_dict).length !== 0) this.computePathToComplete()
    }) 
    .catch(error => {
      this.setState({alert_info: {status: true,
        type: "danger",
        reason: "GetDriverLoc",
        message: error["message"]}})
      console.error(error)
    })
  }


  _handleSlider (props){
    const { value, dragging, index, ...restProps } = props;
    return (
      <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value + "%"}
        visible={dragging}
        placement="top"
        key={index}
      >
        <Handle value={value} {...restProps} />
      </Tooltip>
    )
  }


  _onSliderChange(val){
    if (this.state.newDriverLoc !== null && this.state.legs !== null){
      this.resetErrorMessage()
      this.setState({sliderVal: val})

      var start_x = this.state.legs_dict[this.state.driver_loc_activeLegID_new]["startStop_x"]
      var start_y = this.state.legs_dict[this.state.driver_loc_activeLegID_new]["startStop_y"]

      var end_x = this.state.legs_dict[this.state.driver_loc_activeLegID_new]["endStop_x"]
      var end_y = this.state.legs_dict[this.state.driver_loc_activeLegID_new]["endStop_y"]

      var delta_x = end_x - start_x
      var delta_y = end_y - start_y

      var new_driver_x = start_x + delta_x * this.state.sliderVal / 100
      var new_driver_y = start_y + delta_y * this.state.sliderVal / 100
      
      this.setState({newDriverLoc:{
                                    "x": new_driver_x,
                                    "y": new_driver_y,
                                  }
      })
    } else {
      this.setState({alert_info: {status: true,
        type: "warning",
        reason: "changeSliderLoc",
        message: "Legs, stops and driver location are reqired for this feature to work"}})
    }
  }


  _onLegDropdownButtonPressed(isVisible){
    if (isVisible){
      this.resetErrorMessage()
      if (this.state.legs == null || this.state.legs.length === 0){
        this.setState({alert_info: {status: true,
          type: "warning",
          reason: "newLegID",
          message: "There is no leg ID data available, get leg IDs from the server first"}})
      }
    }
  }
  

  _onPutDriverButtonPressed(){
    this.resetErrorMessage()

    if (this.state.sliderVal !== null && this.state.driver_loc_activeLegID_new !== null){
      var new_driver_location = {"Driver’s current position":
        {
          "activeLegID": this.state.driver_loc_activeLegID_new,
          "legProgress": this.state.sliderVal.toString()
        }
      }
      this.putData(this.backEndUrl + "driver", new_driver_location)
      .then(data => data.json())
      .then(data => {
        this.setState({driver_location: data["Driver’s current position"]})

      // Update driver's location
      if (this.state.driver_location !== null && this.state.stops !== null) this.computePath()

      // Bonus 2: compute path time to complete
      if (Object.keys(this.state.stops_dict).length !== 0 && Object.keys(this.state.legs_dict).length !== 0) this.computePathToComplete()
      }) 
      .catch(error => {
        this.setState({alert_info: {status: true,
          type: "danger",
          reason: "OytDriverLoc",
          message: error["message"]}})
        console.error(error)
      })
    } else {
      this.setState({alert_info: {status: true,
                                  type: "warning",
                                  reason: "putLoc",
                                  message: "New leg progress and ID should be specified first"}})
    }
  }


  _onBonusDriverCoordinatesChanged(newVal, axis="y"){
    this.resetErrorMessage()

    var txt = newVal.target.value
    var err_reason = "inputNumBonusDriver"
    var err_msg = "x and y are integers in [0, 200]"

    var val = this.checkNumInput(txt, 0, 200, err_reason, err_msg)

    // Set the proper values to corresponding coordinates
    if (axis === "x"){
      this.setState({bonus_driver_x_new: val})
    } else {
      this.setState({bonus_driver_y_new: val})
    }
  }


  _onPutBonusDriverButtonPressed(){
    this.resetErrorMessage()

    if (this.state.bonus_driver_x_new !== '' && this.state.bonus_driver_y_new !== ''){
      var new_bonus_driver_location = {"Driver’s current position":
        {
          "x": parseInt(this.state.bonus_driver_x_new),
          "y": parseInt(this.state.bonus_driver_y_new)
        }
      }
      this.putData(this.backEndUrl + "bonusdriver", new_bonus_driver_location)
      .then(data => data.json())
      .then(data => {
        this.setState({bonus_driver_location: data["Driver’s current position"]})

      // Update remaining path
      if (this.state.stops !== null) this.computeBonusRemainingPath()
      }) 
      .catch(error => {
        this.setState({alert_info: {status: true,
          type: "danger",
          reason: "PutBonusDriverLoc",
          message: error["message"]}})
        console.error(error)
      })
    } else {
      this.setState({alert_info: {status: true,
                                  type: "warning",
                                  reason: "putLoc",
                                  message: "New bonus driver's location should be specified first"}})
    }
  }


  _onGetBonusDriverButtonPressed(){
    this.resetErrorMessage()

    this.getData(this.backEndUrl + "bonusdriver")
    .then(data => data.json())
    .then(data => {
      this.setState({bonus_driver_location: data["Driver’s current position"]})
      // Update remaining path
      if (this.state.stops !== null) this.computeBonusRemainingPath()
    }) 
    .catch(error => {
      this.setState({alert_info: {status: true,
        type: "danger",
        reason: "GetBonusDriverLoc",
        message: error["message"]}})
      console.error(error)
    })
  }


  render() {
    return (
      <div className="App">

          {/* Bonus: error handling */}
          {this.state.alert_info["status"] ?
            <Alert bsStyle={this.state.alert_info["type"]}>
              <strong>{this.state.alert_info["type"] === "warning"? "Holy guacamole! " : "Oh snap! "}</strong> 
              {this.state.alert_info["message"]}
            </Alert> :
            null
          }
         

        <h1>Driver Location Challenge</h1>


        {/* Parts 1 & 3: REST GET interface */}
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


        {/* Parts 6, 8 & Bonus 3: Driver location update */}
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100px'}}>
          <ControlLabel bsStyle="default" style={{marginRight: 10, marginTop: 10}}>New Driver's Location</ControlLabel>
          <div style={{width: 300, marginRight: 5, marginLeft: 5, marginBottom:1}}>
            <p style={{height: 11}} >Leg progress</p>
            <Slider min={0} 
                    max={100} 
                    defaultValue={this.state.sliderVal} 
                    value={this.state.sliderVal} 
                    disabled={this.state.sliderVal == null ? true : false} 
                    handle={(props) => this._handleSlider(props)}
                    onChange={(data) => this._onSliderChange(data)} 
                    onAfterChange={(data) => this._onSliderChange(data)}/>
          </div>
          <DropdownButton
            style={{marginRight: 10, marginLeft: 5, width: 100}} 
            id="dropdown_new_leg_ID"
            title={this.state.driver_loc_activeLegID_new == null ? "New leg ID" : this.state.driver_loc_activeLegID_new}
            onToggle={(isVisible) => this._onLegDropdownButtonPressed(isVisible)}
          >
            {Object.keys(this.state.legs_dict).map(this.renderDropdownButton)}
          </DropdownButton>
          <Button style={{marginLeft: 5}} onClick={() => this._onPutDriverButtonPressed()}>
            Put location
          </Button>
        </div>


        {/* Part 4 & others: Vizualization of legs, paths, driver current location, driver new location and bonus driver location  */}
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', marginTop: 20}}>
          <h4><Label>City Map</Label></h4>
        </div>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          <ComposedChart width={900} height={900} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
            <CartesianGrid />
            <XAxis dataKey={'x'} type="number" name='x' domain={[0, 200]}/>
            <YAxis dataKey={'y'} type="number" name='y' domain={[0, 200]}/>
            <Scatter name='stops' data={this.state.stops} fill='#8884d8' shape="cross" fillOpacity={0.7} legendType={this.state.stops == null ? "none" : "cross" }>
              <LabelList dataKey="name" position="top" content={(labelData) => this.formatFigureLabel(labelData)}/>
            </Scatter>
            <Line name="path" dataKey="y" data={this.state.driver_path} fillOpacity={0.7} dot={false} legendType={this.state.driver_path.length ===0 ? "none" : "line" }/>
            <Scatter data={this.state.driver_path.length === 0 ? null : [this.state.driver_path[this.state.driver_path.length-1]]} fill='#FF4500' shape="star" fillOpacity={0.60} legendType="none"/>
            
            <Scatter name='driver' data={this.state.newDriverLoc == null ? null : [this.state.newDriverLoc]} fill='#FF4500' shape="star" legendType="star" fillOpacity={0.95} legendType={this.state.newDriverLoc == null ? "none" : "star"}/>
            
            <Scatter name='bonus driver' data={this.state.bonus_driver_location == null ? null : [this.state.bonus_driver_location]} fill='#FF00FF' shape="diamond" fillOpacity={0.85} legendType={this.state.bonus_driver_location == null ? "none" : "diamond" }/>
            <Line name="bonus path to complete" dataKey="y" data={this.state.path_to_complete} fillOpacity={0.7} dot={false} strokeDasharray="5 5" stroke="#FF00FF" legendType={this.state.path_to_complete == null ? "none" : "line" }/>
            {/* <Tooltip cursor={{strokeDasharray: '3 3'}} content={(data) => this.renderTooltip(data)}/> */}
            {/* <Tooltip content={({payload}) => (<div>{JSON.stringify(payload[0])}</div>)} /> */}
            <Legend height={5} align="center" iconSize={10}/>
          </ComposedChart>
        </div>


        {/* Bonus 1: Bonus driver location */}
        <Form componentClass="fieldset" inline style={{marginTop: 50}}>
          <FormGroup>
            <ControlLabel bsStyle="default" style={{marginRight: 10}}><Label bsStyle="info">Bonus 1</Label> Bonus Driver's Location</ControlLabel>
              <FormControl
                style={{width: 130}}
                type="text"
                value={this.state.bonus_driver_x_new}
                placeholder="Enter x"
                onChange={(newVal) => this._onBonusDriverCoordinatesChanged(newVal, "x")}
              />
              <FormControl
                type="text"
                value={this.state.bonus_driver_y_new}
                placeholder="Enter y"
                style={{width: 130}}
                onChange={(newVal) => this._onBonusDriverCoordinatesChanged(newVal, "y")}
              />
          </FormGroup>
          <Button style={{marginLeft: 10}} onClick={() => this._onPutBonusDriverButtonPressed()}>
            Put location
          </Button>
          <Button style={{marginLeft: 10}} onClick={() => this._onGetBonusDriverButtonPressed()}>
            Get location {this.state.bonus_driver_location == null ? <Glyphicon glyph="glyphicon glyphicon-save" /> : <Glyphicon glyph="glyphicon glyphicon-saved" />}
          </Button>
        </Form>


        {/* Bonus 2: Path completion time */}
        <ControlLabel bsStyle="default" style={{marginTop: 50, marginRight: 45}}><Label bsStyle="info">Bonus 2</Label> Driver's Trip Data</ControlLabel>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          <ControlLabel bsStyle="default" style={{marginRight: 10}}>Time to complete the entire path: </ControlLabel>
          <h4><Label>{this.state.bonus2_time_complete_all_legs == null ? "*" : (this.state.bonus2_time_complete_all_legs).toFixed(2)}</Label></h4>
        </div>
        <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
          <ControlLabel bsStyle="default" style={{marginRight: 35}}>Time left to complete the trip:</ControlLabel>
          <h4><Label>{this.state.bonus2_time_complete == null ? "*" : this.state.bonus2_time_complete.toFixed(2)}</Label></h4>
        </div>
        <Button style={{marginLeft: 10}} onClick={() => this.computePathToComplete()}>
            Compute time {this.state.bonus2_time_complete_all_legs == null ? <Glyphicon glyph="glyphicon glyphicon-save" /> : <Glyphicon glyph="glyphicon glyphicon-saved" />}
        </Button>

      </div>
    );
  }
}

export default App;
