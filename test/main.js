import React from 'react'
import ReactDom from 'react-dom'
import {makeGridWidget} from "../src"
import {testProps, testDevice} from "./data"
import {Subject} from "rxjs";

const elem = document.createElement('div');
elem.setAttribute("id", "root");
document.body.append(elem)

const {api, GridWidget} = makeGridWidget()

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

const config = api.getSelector(state => ({config: state.config, general: state.general}))
config.subscribe(console.log)

global.setCommandHandler = api.setCommandHandler(commands => {
  const responses = new Subject()
  commands.pipe(
  ).subscribe(value => {
    console.log(value)
    setTimeout(() => {
      responses.next(value)
    }, 1000)
  })
  return responses.pipe()
})


let updateInterval = 1000
api.getSelector(state => {
  /**
   * @type DeviceConfig
   */
  const devConfig = state.config.devices.find(dev => dev.name = {
    host: "localhost:10000",
    device: "test",
  })
  if(!devConfig) return 1;
  const attConfig = devConfig.attributes.find(attr => attr.name === "scalar")
  if(!attConfig) return 1;
  return attConfig.pollingPeriodS? attConfig.pollingPeriodS : 1
}).subscribe(value => updateInterval = 1000 * value)

const scalarUpdater = () => setTimeout(() => {
    api.updateAttribute({
      device: {
        host: "localhost:10000",
        device: "test",
      },
      attribute: "scalar",
      value: Math.sin((2 * Math.PI) * ((new Date).getTime() / 60000))
    })
    scalarUpdater()
}, updateInterval)
scalarUpdater()


ReactDom.render(
    <div style={{height: "calc(100vh - 16px)"}}>
        <GridWidget/>
    </div>, 
document.getElementById("root"))

