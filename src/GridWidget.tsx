import React from "react";
import { Device } from "./Tango";

import { Provider, useSelector } from 'react-redux'
import {createSlice, createStore, PayloadAction} from "@reduxjs/toolkit"

import {GridWidgetBase} from "./GridWidgetBase"


export declare interface GridWidgetGeometry {
  cols: number,
  rows: number
}

export declare interface GridWidgetProps {
    devices: Array<Device>
    geometry: GridWidgetGeometry,
    bgcolor?: string // TODO: implement
}


const initialState: GridWidgetProps = {
  geometry: {cols:2, rows: 2},
  devices: []
}

export const gridSlice = createSlice({
  name: 'GridSlice',
  initialState: initialState,
  reducers: {
    setDevice(state, action: PayloadAction<Device>) {

      const newDevice =  action.payload

      const idx = state.devices.findIndex(
        dev => dev.host === newDevice.host && 
        dev.device === newDevice.device )
      
      if(idx === -1) {
        state.devices.push(action.payload)
      } else {
        state.devices[idx] = action.payload
      }
    },
    removeDevice(state, action: PayloadAction<Device>) {
      const deviceToDel =  action.payload
      state.devices = state.devices.filter(dev => 
        dev.host === deviceToDel.host && 
        dev.device === deviceToDel.device)
    },
    updateAttributes(state, action: PayloadAction<Device>) {
      const selDevice =  action.payload
      state.devices = state.devices.map(dev => {
        const match = (dev.host === selDevice.host && 
          dev.device === selDevice.device)
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
    setGeometry(state, action: PayloadAction<GridWidgetGeometry>) {
      state.geometry = action.payload
    }
  },
})

export const gridStore = createStore(gridSlice.reducer);

const GridRoot = () => {
  const selector = useSelector((state: GridWidgetProps) => {return state})
  return <GridWidgetBase geometry={selector.geometry} devices={selector.devices}/>
}

export  function GridWidget(props: GridWidgetProps) {
  return <Provider store={gridStore}>
    <GridRoot />
  </Provider>
}

