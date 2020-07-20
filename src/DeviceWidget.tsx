import React from "react"
import { Member } from "./Tango"
import Typography from "@material-ui/core/Typography"
import Divider from "@material-ui/core/Divider"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import DeleteIcon from "@material-ui/icons/Delete"
import AddIcon from "@material-ui/icons/Add"
import Table from "@material-ui/core/Table"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import TableCell from "@material-ui/core/TableCell"
import TableBody from "@material-ui/core/TableBody"


export declare interface DeviceWidgetProps {
  device: Member
}

export function DeviceWidget(props: DeviceWidgetProps) {

  const {device} = props

  const [dispAttrs, setDispAttrs] = React.useState<Array<string>>([])
  const [newAttr, setNewAttr] = React.useState<string>("")


  const headerStyle: React.CSSProperties = {
    backgroundColor: "rgb(244, 245, 249)",
    borderBottomStyle: "solid",
    borderBottomColor: "rgb(28, 161, 193)",
    borderBottomWidth: "1px",
    fontFamily: "Roboto, sans-serif",
    fontSize: "12px",
    // minHeight: "69px"
  }


  return <> 

    <div style={headerStyle}>
      <Typography><b>{`Device ${device.name} (${device.state.state})`}</b></Typography>
    </div>
    <Divider/>
    <Table size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          <TableCell><b>Attribute</b></TableCell>
          <TableCell align="center">Value</TableCell>
          <TableCell align="right">Modify</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        { dispAttrs.map(attr => {
            const attrData = device.attributes[attr]
            return <TableRow key={attr}>
              <TableCell component="th" scope="row">{attrData.name}</TableCell>
              <TableCell align="center">{attrData.value.value}</TableCell>
              <TableCell align="right"><DeleteIcon onClick={() => {setDispAttrs(dispAttrs.filter(a => a !== attr))}}/></TableCell>
            </TableRow>
          })
        }
        <TableRow key={"new"}>
            <TableCell component="th" scope="row">
              <Select style={{width: "70%", float: "left"}}
                value={newAttr}
                onChange={e => setNewAttr(e.target.value as string)}>
                {Object.keys(device.attributes).filter(attr => (!dispAttrs.includes(attr))).map(attr => {
                  return <MenuItem value={attr} key={attr}>{attr}</MenuItem>
                })}
              </Select>
            </TableCell>
            <TableCell align="center">--</TableCell>
            <TableCell align="right"><AddIcon onClick={() => {setDispAttrs(dispAttrs.concat(newAttr)); setNewAttr("")}}/></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </>
}