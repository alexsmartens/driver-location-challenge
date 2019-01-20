# Driver Location Challenge

## Screenshot
![alt text](https://github.com/alexsmartens/driver-location-challenge/blob/master/interface_screenshot.png)

## About
This project is a submission for the Driver Location Challenge. The project provides a convenient 
way to visualize, store and update track stops and the driver location.

The front end is implemented with [React](https://reactjs.org/) and the back end is implemented with 
Python and [Flask](http://flask.pocoo.org/). The front end is initialized with [create-react-app](
https://github.com/facebook/create-react-app#readme) and includes the following additional libraries:
* [react-bootstrap](react-bootstrap) for custom elements and styles
* [recharts](https://github.com/recharts/recharts) for plotting
* [rc-slider](https://github.com/react-component/slider) and [rc-tooltip](
https://github.com/react-component/tooltip) for a slider
 
The project has been designed and tested on a computer with Windows 10 x64, npm 6.4.1, python 3.7.2.
 
## Usage

### Installation
```
git clone https://github.com/alexsmartens/driver-location-challenge.git
cd .\driver-location-challenge\
npm --prefix ./front-end install
```
### Running on a local machine
from `driver-location-challenge` folder run:

* for lunching the front end
```
npm --prefix ./front-end start
```
* for lunching the back end (in a separate window)
```
cd .\back-end\
python .\service.py
```

By default, the back end runs on `http://localhost:8080/`. This can be changed here on the [back end side](https://github.com/alexsmartens/driver-location-challenge/blob/0256a85d2d98a99ed6af3782ea59794942e06298/back-end/service.py#L110) and on the [front end side](https://github.com/alexsmartens/driver-location-challenge/blob/7c239f7600d3c21fff7f6c1b87c98760003dcbdd/front-end/src/App.js#L45)

### User instruction (following the challenge problem statement)
1.Retrieve the given list of stops and legs from server:
* click on `Get legs` button located in the top row
* click on `Get stops` button located in the top row

2.Stops are visualized automatically as soon as the stops data is received from the server

3.Retrieve the driver’s current position by clicking on `Get driver location` button located in the top row

4.The position of the driver is visualized automatically as soon as it is received from the server

5.The completed section of the leg where the driver is and completed legs are visualized automatically as
soon as the stops and driver current location data is received.

6.The form to change the driver’s current position:
* percentage progress is specified with a slider in `New Driver's Location` section
* active leg is selected via a dropdown menu in `New Driver's Location` section

7.The driver’s current position is updated when `Put location` in `New Driver's Location` section is clicked

8.The visualizations in #4 and #5 are refreshed to reflect the updates to the driver’s current position 
when the PUT response is received
