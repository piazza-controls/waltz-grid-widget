import React from "react";
import { Provider } from 'react-redux'
import {createSlice, createStore, PayloadAction} from "@reduxjs/toolkit"
import {GridWidgetBase} from "./GridWidgetBase"
import { comparator } from "./comparator"
import _ from "lodash"

export declare interface GridWidgetGeometry {
  cols: number,
  rows: number
}

export declare interface AttributeConfig {
  name: string, 
  show?: boolean,
  pollingPeriodS?: number,
  displayPlot?: string
}

export declare interface Attribute {
  name: string, 
  value?: string|number,
  history?: Array<{time: number, value: string|number}>
}

export declare interface CommandConfig {
  name: string, 
  show?: boolean,
}

export declare interface Command {
  name: string, 
}

export declare interface DeviceIdentifier {
  host: string,
  device: string,
}

export declare interface Device {
  name: DeviceIdentifier,
  attributes?: Array<Attribute>
  commands?: Array<Command>
}

export declare interface DeviceConfig {
  name: DeviceIdentifier,
  attributes?: Array<AttributeConfig>
  commands?: Array<CommandConfig>
}

export declare interface PlotSettings {
  id: string,
  name: string,
  // TODO: add time crop threshold
}

export declare interface GridWidgetStore {
  general?: {
    geometry?: GridWidgetGeometry,
    bgcolor?: string,
    plots?: Array<PlotSettings>
  },
  devices?: Array<Device>
  config?: {
    devices?: Array<DeviceConfig>
  }
}

export declare type CommandCallback = (
  name: {device: DeviceIdentifier, name: String}
) => void


const initialState: GridWidgetStore = {
  general: {
    geometry: {cols:2, rows: 2},
    bgcolor: "#f4f5f9"
  },
  devices: [],
  config: {
    devices: []
  }
}

export const gridSlice = createSlice({
  name: 'GridSlice',
  initialState: initialState,
  reducers: {
    setState(state, action: PayloadAction<GridWidgetStore>) {
      return action.payload
    },
    setDevice(state, action: PayloadAction<Device>) {
      const newDevice =  _.cloneDeep(action.payload)
      
      const devIdx = state.devices.findIndex(
        dev => _.isEqual(dev.name, newDevice.name) )
      if(devIdx === -1) {
        state.devices.push(newDevice)
      } else {
        state.devices[devIdx] = newDevice
      }

      if(!state.config)
        state.config = {}
      if(!state.config.devices)
        state.config.devices = []

      const devConfIdx = state.config.devices.findIndex(
        dev => _.isEqual(dev.name, newDevice.name) )
      if(devConfIdx === -1) {
        state.config.devices.push({name: newDevice.name, commands: [], attributes: []})
      } else {
        state.config.devices[devConfIdx] = {name: newDevice.name, commands: [], attributes: []}
      }
    },
    removeDevice(state, action: PayloadAction<Device>) {
      const deviceToDel =  action.payload
      state.devices = state.devices.filter(dev =>(!_.isEqual(dev.name, deviceToDel.name)))
    },
    updateAttributes(state, action: PayloadAction<Device>) {
      const selDevice =  action.payload
      state.devices = state.devices.map(dev => {
        const match = _.isEqual(dev.name, selDevice.name)
        if(match) {
          selDevice.attributes.forEach(selAttr => {
            const attrIdx = dev.attributes.findIndex(attr => attr.name === selAttr.name) 
            if(attrIdx === -1) {
              dev.attributes.push(selAttr)
            } else {
              dev.attributes[attrIdx] = selAttr
            }
          })
        }
        return dev
      })
    },
    applyDiff(state, action: PayloadAction<GridWidgetStore>) {
      _.mergeWith(state, action.payload, comparator)  
    },
    setGeometry(state, action: PayloadAction<GridWidgetGeometry>) {
      state.general.geometry = action.payload
    },
    setBgColor(state, action: PayloadAction<string>) {
      state.general.bgcolor = action.payload
    },
    createNewPlot(state, action: PayloadAction<string>) {
      if(!state.general.plots)
        state.general.plots = []
      state.general.plots.push({
        name: `${action.payload}`,
        id: action.payload
      })
    },
    removePlot(state, action: PayloadAction<PlotSettings>) {
      console.log(action.payload)
      state.general.plots = state.general.plots.filter(plot => plot.id !== action.payload.id)
      state.config.devices.forEach((device, deviceIdx) => {
        device.attributes.map((attr, attrIdx) => {
          if(attr.displayPlot === action.payload.id) {
            state.config.devices[deviceIdx].attributes[attrIdx].displayPlot = null
          }
        })
      })
    },
    runCommand(state, action: PayloadAction<{device: DeviceIdentifier, name: String, cb?: CommandCallback}>) {
      const {cb, device, name} = action.payload
      if(cb) cb({device: device, name: name})
    }
  },
})

export function makeGridWidget(cmdRunCb: CommandCallback) {
  const store = createStore(gridSlice.reducer);
  return {
    api: {
      store: store,
      setState: (state: GridWidgetStore) => {
        store.dispatch(gridSlice.actions.setState(state))
      },
      setDevice: (device: Device) => {
        store.dispatch(gridSlice.actions.setDevice(device))
      },
      removeDevice: (device: Device) => {
        store.dispatch(gridSlice.actions.removeDevice(device))
      },
      updateAttributes: (device: Device) => {
        store.dispatch(gridSlice.actions.updateAttributes(device))
      },
      applyDiff: (diff: GridWidgetStore) => {
        store.dispatch(gridSlice.actions.applyDiff(diff))
      },
      setGeometry: (geom: GridWidgetGeometry) => {
        store.dispatch(gridSlice.actions.setGeometry(geom))
      },
      setBgColor: (color: string) => {
        store.dispatch(gridSlice.actions.setBgColor(color))
      },
      createNewPlot: (plotId: string) => {
        store.dispatch(gridSlice.actions.createNewPlot(plotId))
      },
      removePlot: (plot: PlotSettings) => {
        store.dispatch(gridSlice.actions.removePlot(plot))
      },
      runCommand: (device: DeviceIdentifier, name: String, cb: CommandCallback = cmdRunCb) => {
        store.dispatch(gridSlice.actions.runCommand({device, name, cb}))
      }
    },
    GridWidget: function GridWidget() {
      return <Provider store={store}>
        <GridWidgetBase cmdRunCb={cmdRunCb} />
      </Provider>
    }
  }
}



