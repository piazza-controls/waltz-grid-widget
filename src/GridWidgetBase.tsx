import React from "react";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import {DeviceWidget} from "./DeviceWidget"
import {gridSlice, GridWidgetStore } from "./GridWidget";
import SettingsIcon from '@material-ui/icons/Settings';
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector, useDispatch } from "react-redux";
import { PlotWidget } from "./PlotWidget";
import _ from "lodash";
import FormLabel from "@material-ui/core/FormLabel";

export const widgetMinSize = {
  width: 374,
  height: 255
}

const listStyle: React.CSSProperties = {
  height: "100%",
  color: "#475466",
  display: "flex",
  flexFlow: "column"
}

const settingsStyle: React.CSSProperties = {
  height: "40px",
}

const elementStyle: React.CSSProperties = {
  height: "100%",
  width: "min-content",
  display: "inline-block",
  marginLeft: "4px",
  marginRight: "4px"
}


type Setting<T> = {
  key: string,
  label?: string,
  description?: string,
  type:  "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden"
  value: T
  onChangeValue: (value: T) => void
} | {
  key: string,
  label?: string,
  description?: string,
  type:  "number",
  min?: number,
  max?: number,
  value: T,
  onChangeValue: (value: T) => void
}  | {
  key: string,
  label?: string,
  description?: string,
  type:  "select",
  items: Array<{name: string, value: T}>,
  value: T,
  onChangeValue: (value: T) => void
}  | {
  key: string,
  label?: string,
  description?: string,
  type:  "nested",
  items: Array<Setting<any>>,
}

function renderSetting(value: Setting<any>) {

  const labelId = `${value.key}-label`
  const inputId = `${value.key}-input`
  const helperId = `${value.key}-helper-text`

  switch (value.type) {
    case "select":
      return <FormControl>
        <InputLabel id={labelId}>{value.label ? value.label : value.key}</InputLabel>
        <Select
            labelId={labelId}
            id={inputId}
            value={JSON.stringify(value.value)}
            onChange={(e) => {
              value.onChangeValue(JSON.parse(e.target.value as string))
            }}
        >
          {
            value.items.map(item => {
              return <MenuItem key={item.name} value={JSON.stringify(item.value)}>{item.name}</MenuItem>
            })
          }
        </Select>
      </FormControl>
    case "nested":
      return <FormControl>
        <div >
          <FormLabel>{value.label ? value.label : value.key}</FormLabel>
        </div>
        <div style={{display: "inline-block"}}>
          {
            value.items.map(renderSetting)
          }
        </div>
      </FormControl>
    case "number":

      console.log(value)
      return <FormControl key={value.key} style={{margin: "5px", width: "100px"}}>
        <InputLabel htmlFor={inputId}>{value.label ? value.label : value.key}</InputLabel>
        {value.description ? <>
          <Input id={inputId} aria-describedby={helperId} type="number"
             inputProps={{
               min: value.min,
               max: value.max
             }}
            value={value.value}
            onChange={(e) => {
              value.onChangeValue(e.target.value)
          }}/>
          <FormHelperText id={helperId}>{value.description}</FormHelperText>
        </> :
            <Input id={inputId} type="number"
               inputProps={{
                 min: value.min,
                 max: value.max
               }}
                value={value.value}
                onChange={(e) => {
                  value.onChangeValue(e.target.value)
                }}
            />
        }
      </FormControl>
    default:
      return <FormControl key={value.key} style={{margin: "5px"}}>
        <InputLabel htmlFor={inputId}>{value.label ? value.label : value.key}</InputLabel>
        {value.description ? <>
          <Input id={inputId} aria-describedby={helperId} type={value.type} value={value.value}  onChange={(e) => {
            value.onChangeValue(e.target.value)
          }}/>
          <FormHelperText id={helperId}>{value.description}</FormHelperText>
        </> : <Input id={inputId} type={value.type} value={value.value} onChange={(e) => {
          value.onChangeValue(e.target.value)
        }}/>
        }
      </FormControl>
  }
}


function Settings(props: {values: Array<Setting<any>>}) {

  const {values} = props
  const [expanded, setExpanded] = React.useState(false)


  return <div style={{height: "min-content"}}>
  <Paper hidden={!expanded}>
    <div>{values.map(renderSetting)}</div>
    
  </Paper>
  <Paper style={settingsStyle}>
      <div style={{...elementStyle, float: "right"}}>
        <IconButton style={{ height: "100%"}} onClick={() => setExpanded(!expanded)}>
          <SettingsIcon/>
        </IconButton>
      </div>
  </Paper>
  </div>

}


export function GridWidgetBase() {

    const selector = useSelector((state: GridWidgetStore) => {return state})
    const dispatch = useDispatch()
    const {setGeometry, setBgColor} = gridSlice.actions

    const {geometry, bgcolor} = selector.general

    const tileStyle: React.CSSProperties = {
      minWidth: `${widgetMinSize.width}px`,
      minHeight:`${widgetMinSize.height}px`,
      height: `calc(100%/${geometry.rows})`,
      background: "#ebedf0"
    }

    const tileInnerStyle: React.CSSProperties = {
      height: "calc(100% - 4px)",
      borderStyle: "solid",
      borderWidth: "2px",
      borderColor: "#DADEE0",
      background: "white", 
      backgroundClip: "content-box",
    }

    const widgetsCount = geometry.cols * geometry.rows
    return <div style={{...listStyle,
      minWidth: `${geometry.cols * (widgetMinSize.width + 5)}px`,
      minHeight: `${geometry.rows * (widgetMinSize.height)}}px`}} >
      <GridList cols={geometry.cols} spacing={4} style={{flexGrow : 1, overflow: "auto"}}>
            {
              (Array.from(Array(widgetsCount).keys())).map(idx => {
                if(selector.devices.length > idx) {
                  return <GridListTile className={"webix_view"} style={tileStyle} key={idx}>
                    <div style={tileInnerStyle}>
                      <DeviceWidget device={selector.devices[idx]} color={bgcolor}/>
                    </div>
                  </GridListTile>
                } else if(_.isArray(selector.general.plots) && selector.devices.length + selector.general.plots.length > idx) {
                  return <GridListTile className={"webix_view"} style={tileStyle} key={idx}>
                    <div style={tileInnerStyle}>
                      <PlotWidget plot={selector.general.plots[idx - selector.devices.length]} color={bgcolor}/>
                    </div>
                  </GridListTile>
                }
                else {
                  return <GridListTile style={tileStyle} key={idx}>empty</GridListTile>
                }
              })
            }
      </GridList>
      <Settings values={[{
        key: "color",
        label: "Color",
        value: bgcolor,
        onChangeValue: (color: string) => dispatch(setBgColor(color)),
        type: "color",
        description: "background color"
      }, {
        key: "geometry",
        label: "Geometry",
        type: "nested",
        items: [
          {
            key: "rows",
            label: "Rows",
            type: "number",
            min: 1,
            max: 12,
            value: geometry.rows,
            onChangeValue: (rows: number) => dispatch(setGeometry({cols: geometry.cols, rows}))
          },
          {
            key: "cols",
            label: "Cols",
            type: "number",
            min: 1,
            max: 12,
            value: geometry.cols,
            onChangeValue: (cols: number) => dispatch(setGeometry({rows: geometry.rows, cols}))
          }
        ]
      }]}/>
    </div>
}