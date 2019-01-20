# Driver Location Challenge Features

## Problem Statement Bonus Features

### Bonus 1

1.New bonus driver location (x, y) can be entered in the corresponding text form fields in 
`Bonus 1: Bonus Driver Location` section below the main figure

2.The bonus driver’s current location is updated when `Put location` in 
`Bonus 1: Bonus Driver Location` section is clicked

3.The bonus driver’s current location is retrieved on `Get location` button click in 
`Bonus 1: Bonus Driver Location` section below the main figure

4.Bonus driver location visualization:
* the bonus driver location is s visualized automatically as soon as it is received from the server
* a line between the bonus driver’s location and the closest stop as well as the remaining path from 
the closest stop to the final stop is visualized as soon as the stops and the bonus driver’s current 
location data is received

### Bonus 2

The time of how long it will take the driver to complete the entire path (all of the legs) and the 
time of how much time is left for the driver based on the current position are computed and 
displayed as soon as the legs, stops and the driver current location data is received. The
computed values are displayed in the very bottom of the page under `Bonus 2: Driver's Trip Data`
section. Additionally, `Compute time` button replicates the request to the mentioned above compute 
method. In the current setup this button is useful only for the status of the time computation 
process, however it might be useful in other scenarios. 

### Bonus 3

The change of the driver's current position is implemented with a slider. The change is visualized in 
real time.



## Custom Improvement Features

### Improvement 1: Leg Change Visualization

The leg change of the driver's current position (from the dropdown menu) is visualized in real time.

### Improvement 2: Invalid Input and Server Response Error Handling

**Warning message on incorrect text input**: the text input is parsed in the way that only number characters 
are allowed as well as only the numbers within the specified range are allowed. If the user inputs
a number outside of the allowed range then the input number becomes a min or max number of the 
range correspondingly to the entered number. In this situation or in a situation when the user 
tries to input a non-numeric character the warning message is displayed in top of the page. 
The warning message is yellow (because it is a warning not an error) and it describes the 
correct input format.

**Warning message on incorrect action request**: when the user tries to use a feature without all the 
data that is needed for the feature to work then the warning message describing what kind of 
data is needed for this feature to work is displayed in yellow. Example, when the user tries to PUT a new 
bonus driver's location without specifying this location.

**Error message on communication with the back end**: when a problem occurs in communication with the 
back end then the error message describing the problem is displayed in red.


### Improvement 3: Process Status on Buttons

Buttons depending on receiving the data have icons showing whether the corresponding data has been 
received.

### Improvement 4: Page Design