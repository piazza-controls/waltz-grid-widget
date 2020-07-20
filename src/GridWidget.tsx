import * as React from "react";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import { Member } from "./Tango";
import DeviceWidget from "./DeviceWidget"

// import "webix/webix.css"

export declare interface GridWidgetProps {
    devices: Array<Member>
    geometry: {
        cols: number,
        rows: number
    }
}

export function GridWidget(props: GridWidgetProps) {


    const tileStyle: React.CSSProperties = {
      height: `calc(100%/${props.geometry.rows})`,
      background: "rgb(235, 237, 240)"
    }

    const tileInnerStyle: React.CSSProperties = {
      height: "calc(100% - 4px)",
      borderStyle: "solid",
      borderWidth: "2px",
      borderColor: "#DADEE0",
      background: "white", 
      backgroundClip: "content-box"
    }

    const listStyle: React.CSSProperties = {
      height: "100%",
      color: "#475466"
    }

    const widgetsCount = props.geometry.cols * props.geometry.rows

    return <GridList  cols={props.geometry.cols}  style={listStyle} spacing={4}>
      {
        (Array.from(Array(widgetsCount).keys())).map(idx => {
          if(props.devices.length > idx) {
            return <GridListTile className={"webix_view"} style={tileStyle} key={idx}>
              <div style={tileInnerStyle}>
                <DeviceWidget device={props.devices[idx]}/>
              </div>
              
            </GridListTile>
          } else {
            return <GridListTile style={tileStyle} key={idx}>empty</GridListTile>
          }
        })
      }
    </GridList>
}

