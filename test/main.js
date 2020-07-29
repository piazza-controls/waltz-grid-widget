import React from 'react'
import ReactDom from 'react-dom'
import {makeGridWidget} from "../src/GridWidget"
import {testProps, testDevice} from "./data"

const elem = document.createElement('div');
elem.setAttribute("id", "root");
document.body.append(elem)

const {api, GridWidget} = makeGridWidget(() => console.log("It WORKS!!"))

// gridStore.getState()
global.testProps = testProps
global.testDevice = testDevice
global.testDevice2 = {...testDevice, name: {...testDevice.name, device: "test2"}}
global.api = api
api.setState(testProps)
api.setDevice(testDevice)
api.applyDiff({config: {devices: [{name: testDevice.name, attributes: [{name: "double_scalar", show: true}]}]}})
api.updateAttributes({
  name: {
    host: "localhost:10000",
    device: "test",
  },
  attributes: [
    {
      name: "scalar",
      value: 111
    }
  ],
  commands: []
})

ReactDom.render(
    <div style={{height: "100vh"}}>
        <GridWidget/>
    </div>, 
document.getElementById("root"))

