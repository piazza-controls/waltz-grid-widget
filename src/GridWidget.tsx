import React from "react";
import {Provider} from 'react-redux'
import {AnyAction, createSlice, createStore, PayloadAction, Store, Middleware, applyMiddleware} from "@reduxjs/toolkit"
import {GridWidgetBase} from "./GridWidgetBase"
import {mergeComp} from "./comparators"

import _ from "lodash"
import {getSelector$, getState$} from "./utils/rx";
import {Observable, Subject} from "rxjs";

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

export declare interface AttributeResponse {
  device: DeviceIdentifier,
  attribute: string,
  value?: string|number
}

export declare interface CommandConfig {
  name: string, 
  show?: boolean,
}

// TODO: inheritance
export declare interface CommandData<T, O> {
  args?: T,
  value?: O
}

export declare interface Command {
  name: string,
  value?: CommandData<any, any>,
  history?: Array<{time: number, value: CommandData<any, any>}>
}

export declare interface DeviceIdentifier {
  host: string,
  device: string,
}

export declare interface Device {
  name: DeviceIdentifier,
  state: string,
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

declare interface CommandRequest<T> {
  device: DeviceIdentifier,
  command: string,
  args?: T
}

declare interface CommandResponse<T, O> {
  device: DeviceIdentifier,
  command: string,
  args?: T,
  value?: O
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
        state.devices[devIdx] = _.mergeWith(newDevice, state.devices[devIdx], mergeComp)
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
        state.config.devices[devConfIdx] = _.mergeWith(
            {name: newDevice.name, commands: [], attributes: []},
            state.config.devices[devConfIdx],
            mergeComp
        )
      }
    },
    removeDevice(state, action: PayloadAction<Device>) {
      const deviceToDel =  action.payload
      state.devices = state.devices.filter(dev =>(!_.isEqual(dev.name, deviceToDel.name)))
    },
    updateAttribute(state, action: PayloadAction<AttributeResponse>) {
      console.log(action)
      const devIdx = state.devices.findIndex(dev => _.isEqual(dev.name, action.payload.device))
      if(devIdx !== -1) {

        if(!state.devices[devIdx].attributes) {
          state.devices[devIdx].attributes = []
        }

        const attIdx = state.devices[devIdx].attributes.findIndex(att => _.isEqual(att.name, action.payload.attribute))
        if(attIdx !== -1) {
          if(!state.devices[devIdx].attributes[attIdx].history) {
            state.devices[devIdx].attributes[attIdx].history = []
          }

          state.devices[devIdx].attributes[attIdx].value = action.payload.value
          state.devices[devIdx].attributes[attIdx].history.push({
            time: new Date().getTime(),
            value: action.payload.value
          })
          // TODO: add time filtering
        } else {
          // TODO: error handling
          console.error(`cant find ${action.payload.device}: ${action.payload.attribute} attribute`)
        }
      } else {
        // TODO: error handling
        console.error(`cant find ${action.payload.device} device`)
      }
    },
    applyDiff(state, action: PayloadAction<GridWidgetStore>) {
      return _.mergeWith(state, action.payload, mergeComp)
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
    setPlot(state, action: PayloadAction<PlotSettings>) {

        const hasPlot =  state.general.plots.findIndex(plot => plot.id === action.payload.id)

        if(hasPlot !== -1) {
          state.general.plots[hasPlot] = action.payload
        } else {
          state.general.plots.push(action.payload)
        }

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
    runCommand(state, _: PayloadAction<CommandRequest<any>>) {},
    updateCommand(state, action: PayloadAction<CommandResponse<any, any>>) {
      console.log(action)
      const devIdx = state.devices.findIndex(dev => _.isEqual(dev.name, action.payload.device))
      if(devIdx !== -1) {

        if(!state.devices[devIdx].commands) {
          state.devices[devIdx].commands = []
        }

        const cmdIdx = state.devices[devIdx].commands.findIndex(cmd => _.isEqual(cmd.name, action.payload.command))
        if(cmdIdx !== -1) {
          if(!state.devices[devIdx].commands[cmdIdx].history) {
            state.devices[devIdx].commands[cmdIdx].history = []
          }

          state.devices[devIdx].commands[cmdIdx].value = action.payload
          state.devices[devIdx].commands[cmdIdx].history.push({
            time: new Date().getTime(),
            value: action.payload
          })

          // TODO: add time filtering

        } else {
          // TODO: error handling
          console.error(`cant find ${action.payload.device}: ${action.payload.command} command`)
        }
      } else {
        // TODO: error handling
        console.error(`cant find ${action.payload.device} device`)
      }
    }
  },
})

export function createRxCommandMiddleware<T>(commands: Subject<CommandRequest<T>>) {
  const middleware: Middleware<{},GridWidgetStore> = _ => next => (action: PayloadAction) => {
    if(action.type === "GridSlice/runCommand") {
      const runCommand = ((action as any) as PayloadAction<CommandRequest<T>>)
      commands.next(runCommand.payload)
    } else {

    } return next(action)
  }
  return middleware
}

declare type CommandHandler<T, O> = (commands: Subject<CommandRequest<T>>) => Observable<CommandResponse<T, O>>

export function setCommandHandler$<T, O>(
    commands: Subject<CommandRequest<any>>,
    store: Store<GridWidgetStore, AnyAction>,
    handler: CommandHandler<T, O> )
{
    const handle = handler(commands)
    // TODO: error handling
    handle.subscribe(value => {store.dispatch(gridSlice.actions.updateCommand(value))})
    return handle
}


export function makeGridWidget() {

  const commands = new Subject<CommandRequest<any>>()
  const rxCommandMiddleware = createRxCommandMiddleware<any>(commands)

  const store = createStore(
      gridSlice.reducer,
      applyMiddleware(rxCommandMiddleware)
  );

  const state$ = getState$(store);
  const getSelector = <T extends unknown>(selector: (state: GridWidgetStore) => T) => {
    return getSelector$<T>(state$, selector)
  }

  const setCommandHandler = <T extends unknown, O extends unknown> (
      handler: CommandHandler<T, O>) => {
    console.log(handler)
    return setCommandHandler$<T, O>(commands, store, handler)
  }

  return {
    api: {
      state: state$,
      getSelector: getSelector,
      setCommandHandler: setCommandHandler,
      setState: (state: GridWidgetStore) => {
        store.dispatch(gridSlice.actions.setState(state))
      },
      setDevice: (device: Device) => {
        store.dispatch(gridSlice.actions.setDevice(device))
      },
      removeDevice: (device: Device) => {
        store.dispatch(gridSlice.actions.removeDevice(device))
      },
      updateAttribute: (response: AttributeResponse) => {
        store.dispatch(gridSlice.actions.updateAttribute(response))
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
      setPlot: (plot: PlotSettings) => {
        store.dispatch(gridSlice.actions.setPlot(plot))
      },
      // TODO: add type template
      runCommand: (request: CommandRequest<any>) => {
        store.dispatch(gridSlice.actions.runCommand(request))
      }
    },
    GridWidget: function GridWidget() {
      return <Provider store={store}>
        <GridWidgetBase/>
      </Provider>
    }
  }
}



