import React from 'react'
import ReactDom from 'react-dom'

import {GridWidget, gridSlice, gridStore} from "../src/GridWidget"
import {testProps, testDevice} from "./data"

const elem = document.createElement('div');
elem.setAttribute("id", "root");
document.body.append(elem)

const {geometry, devices} = testProps


// gridStore.getState()
global.gridStore = gridStore
global.gridSlice = gridSlice
global.testDevice = testDevice
gridStore.dispatch(gridSlice.actions.setState(testProps))
gridStore.dispatch(gridSlice.actions.setDevice(testDevice))
gridStore.dispatch(gridSlice.actions.updateAttributes({
    host: "localhost:10000",
    device: "test",
    attributes: [
      {
        name: "scalar",
        value: 111
      }
    ],
    commands: []
}))

ReactDom.render(
    <div style={{height: "100vh"}}>
        <GridWidget geometry={geometry} devices={devices}></GridWidget>
    </div>, 
document.getElementById("root"))

