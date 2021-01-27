import React from 'react'
import ReactDom from 'react-dom'
import {makeGridWidget} from "../src"
import {testProps, testDevice} from "./data"

const elem = document.createElement('div');
elem.setAttribute("id", "root");
document.body.append(elem)

const {api, GridWidget} = makeGridWidget((cmd) => {
  const {device, name} = cmd 
  console.log(device, name)
  if(name === "start_device") {
    setTimeout(() => { 
      const state = api.store.getState()
      api.updateAttributes({...state.devices[0], state: "RUNNING"})
      }, 0)
  } else if (name === "stop_device") {
    setTimeout(() => { 
      const state = api.store.getState()
      api.updateAttributes({...state.devices[0], state: "STOPPED"})
    }, 0)
  } else if (name === "make_data") {
    setTimeout(() => { 
      const state = api.store.getState()
      const dev = state.devices[0]
      api.updateAttributes({...dev, attributes: [{
        name: "double_scalar",
        value: 245,
        history: [{
          time: 0,
          value: 242
        },{
          time: 1,
          value: 241
        },{
          time: 2,
          value: 242
        },{
          time: 3,
          value: 242
        },{
          time: 4,
          value: 244
        },]
      }]})
    }, 0)
  } else {

  }
  
 
})

// api.setCallback(cmd => {

//   const {device, name} = cmd
//   console.log(device, name);
//    {
//     api.store.dispatch(api.store.)
//     api.applyDiff({config: {devices: [{
//       name: testDevice.name, 
//       attributes: [{name: "double_scalar", show: true}],
//       commands: [{
//         name: "start_device",
//         show: true
//       }, {
//         name: "stop_device",
//         show: true
//       }]
//     }]}})
//   }
//   // console.log(api);
// })

// gridStore.getState()
global.testProps = testProps
global.testDevice = testDevice
global.testDevice2 = {...testDevice, name: {...testDevice.name, device: "test2"}}
global.api = api
api.setState(testProps)
api.setDevice(testDevice)
api.applyDiff({config: {devices: [{
  name: testDevice.name, 
  attributes: [{name: "double_scalar", show: true}],
  commands: [{
    name: "start_device",
    show: true
  }, {
    name: "stop_device",
    show: true
  }, {
    name: "make_data",
    show: true
  }]
}]}})
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
  commands: [
  ]
})

ReactDom.render(
    <div style={{height: "100vh"}}>
        <GridWidget/>
    </div>, 
document.getElementById("root"))

