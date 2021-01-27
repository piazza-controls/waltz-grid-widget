import React from "react"
import { GridWidgetStore, PlotSettings, gridSlice } from "./GridWidget"
import Typography from "@material-ui/core/Typography"
import Divider from "@material-ui/core/Divider"

import _ from "lodash"
import { useSelector, useDispatch } from "react-redux"
import PlotlyChart from 'react-plotlyjs-ts';
import IconButton from "@material-ui/core/IconButton"
import SettingsIcon from '@material-ui/icons/Settings';
import CheckIcon from '@material-ui/icons/Check';
import TextField from '@material-ui/core/TextField';
import {headerStyle} from "./utils/header/style";
import {CloseButton} from "./utils/header/CloseButton";


export declare interface PlotWidgetProps {
  plot: PlotSettings,
  color: string
}

export function PlotWidget(props: PlotWidgetProps) {

  const {plot, color} = props
  const config = useSelector((state: GridWidgetStore) => state.config.devices)
  const devices = useSelector((state: GridWidgetStore) => state.devices)
  const dispatch = useDispatch()
  const {removePlot, setPlot} = gridSlice.actions

  const [configMode, setConfigMode] = React.useState<boolean>(false)
  const [tempName, setTempName] = React.useState<string>(plot.name)

  const items = _.flatMap(config, deviceConf => {
    const attrsToPlot = deviceConf.attributes.filter(attr => attr.displayPlot == plot.id)
    return attrsToPlot.map(attr => ({
      device: deviceConf.name,
      attribute: attr.name
    }))
  })


  const configButton = <>
    {configMode?
        <IconButton onClick={() => {
          dispatch(setPlot({...plot, name: tempName}))
          setConfigMode(!configMode)}}>
            <CheckIcon/>
        </IconButton>
      :
        <IconButton onClick={() => setConfigMode(!configMode)}>
          <SettingsIcon/>
        </IconButton>
    }
  </>
  
  const data = items.map(item => {
    const name = `${item.device.host}/${item.device.device}/${item.attribute}`
    const device = devices.find(dev => _.isEqual(dev.name, item.device))
    if(!device) return {
      name: `${name} (device not found)`,
      type: 'scatter',
    }
    if(!device.attributes) return {
      name: `${name} (device attributes not found)`,
      type: 'scatter',
    }
    const attr = device.attributes.find(a => _.isEqual(a.name, item.attribute))
    if(!attr) return {
      name: `${name} (attribute not found)`,
      type: 'scatter',
    }
    if(!attr.history) return {
      name: `${name} (attribute history not found)`,
      type: 'scatter',
      x: [],
      y: []
    }
    return {
      name: `${name}`,
      type: 'scatter',
      x: attr.history.map(p => p.time),
      y: attr.history.map(p => p.value)
    }
  })
  
  const layout = {
      // showlegend: true,
      xaxis: {
          title: 'time'
      },
      autosize: true
  };

  return <> 
    <div style={{...headerStyle, backgroundColor: color}}>
      
      <Typography>
      {
        configMode? 
        <b>Plot <TextField value={tempName} onChange={e => {
          setTempName(e.target.value)
        }}/></b>
        :
        <b>{`Plot ${plot.name}`}</b>
      }
        
      {configButton}
      <CloseButton onClose={() => dispatch(removePlot(plot))}/>
      </Typography>
    </div>
    <Divider/>
    <div
     style={{
      overflowY: "scroll",
       height: "calc(100% - 48px)"
     }}
    >
      <PlotlyChart data={data} layout={layout} />
    </div>

  </>
}