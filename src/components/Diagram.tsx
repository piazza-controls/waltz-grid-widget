import * as React from "react";
import { useDrop } from 'react-dnd'
import {ItemTypes} from "./TangoTree";
import {DropTargetMonitor} from "react-dnd/lib/interfaces/monitors";
import {useEffect, useRef, useState} from "react";
import TangoController, {Selector} from "../controllers/Tango";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {Rnd} from "react-rnd"
import {FormControl} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import * as lodash from "lodash"


declare interface Device {
    geometry: {
        x: number,
        y: number,
        w: number,
        h: number,
    }

    reference: {
        host: string
        port: number
        path: string
    }

    display?: {
        attributes: {
            [name: string]: {}
        }
    }
}

export default function() {

    const el = useRef(null);
    // TODO: remove initial value
    const [devices, setDevices] = useState<Array<Device>>([{
        geometry:{x:0.644,y:0.4178079965018945,w:0.10,h:0.15},
        reference:{host:"tango-cs", port:10000, path:"sys/tg_test/1"},
        display: {
            attributes: {}
        }},]
    )
    const [display, setDisplay] = useState<Selector>({})
    const [newAttr, setNewAttr] = useState<string>("")

    const selector = TangoController.selector
    const {load} = TangoController.actions

    useEffect(() => {
        const interval = setInterval(() => {

            const selector: Selector = {

            }
            devices.forEach(device => {
                const {host, port} = device.reference
                const [domain, family, member] = device.reference.path.split("/")
                if(!selector.hasOwnProperty(host)) {selector[host] = {}}
                if(!selector[host].hasOwnProperty(port)) { selector[host][port] = {devices: {

                }}}
                if(!selector[host][port].devices.hasOwnProperty(domain)) {
                    selector[host][port].devices[domain] = {}
                }
                if(!selector[host][port].devices[domain].hasOwnProperty(family)) {
                    selector[host][port].devices[domain][family] = {}
                }if(!selector[host][port].devices[domain][family].hasOwnProperty(member))
                {
                    selector[host][port].devices[domain][family][member] = {
                        attributes: {},
                        // properties: {"*": true},
                        // state: true
                    }
                }
            })
            console.log(lodash.merge(selector, display))
            load(lodash.merge({}, display, selector))
        }, 6000);
        return () => clearInterval(interval);
    }, [devices, selector, display]);

    const getDropPos = (monitor: DropTargetMonitor): {x: number, y: number} => {
        const p0 =  monitor.getInitialClientOffset()
        const diff = monitor.getDifferenceFromInitialOffset()
        const bnd: DOMRect = el.current.getBoundingClientRect()
        return  {x: (p0.x + diff.x - bnd.x) / bnd.width, y: (p0.y + diff.y - bnd.y) / bnd.height}
    }

    const [_, drop] = useDrop({
        accept: ItemTypes.TREE_ITEM,
        drop: (item, monitor) => {
            console.log(item, monitor)
            const pos = getDropPos(monitor)
            const device = {
                geometry: {
                    x: pos.x,
                    y: pos.y,
                    w: 0.25,
                    h: 0.25,
                },
                reference: {
                    host: (item as any).host,
                    port: (item as any).port,
                    path: (item as any).id
                }
            }
            setDevices(prevDevices => ([...prevDevices, device]))
        }
    })


    return <div ref={el} style={{width: "100%", height: "100%"}}
                // style={{display: "inline-block"}}
    >
        {devices.map(dev => {
            const xP = dev.geometry.x * 100
            const yP = dev.geometry.y * 100
            const wP = dev.geometry.w * 100
            const hP = dev.geometry.h * 100

            const {host, port} = dev.reference
            const [domain, family, member] = dev.reference.path.split("/")

            const device = selector.servers[host]?.[port]?.value?.devices.value?.[domain]?.[family]?.[member]?.value

            const attributes = device?.attributes.value

            console.log(attributes)

            const disp = display[host]?.[port]?.devices?.[domain]?.[family]?.[member]?.attributes

            const displayAttrs = disp? Object.keys(disp).map(key => {
                  return {
                      key,
                      value: device?.attributes.value?.[key].value?.value?.value
                  }
            }): undefined

            return <Rnd default={{
                    x: 0,
                    y: 0,
                    width: 320,
                    height: 200,
                }}> <Card style={{height: "100%", width: "100%"}}>
                    <CardContent>
                        <Typography  color="textSecondary" gutterBottom>
                            {`${domain}/${family}/${member}`}
                        </Typography>

                        {displayAttrs? displayAttrs.map(attr => {
                            return <Typography>{`${attr.key}: ${attr.value}`}</Typography>
                        }): <></>}

                        {attributes? <FormControl variant="outlined" style={
                            {width: "100%", display: "inline-block", justifyContent: "space-between"}}>
                            {/*<InputLabel id="demo-simple-select-outlined-label">Age</InputLabel>*/}
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                value={newAttr}
                                onChange={e => setNewAttr(e.target.value as string)}
                                // label="Age"
                                style={{width: "70%", float: "left"}}
                            >
                                {Object.keys(attributes).map(attr => {
                                    return <MenuItem value={attr} key={attr}>{attr}</MenuItem>
                                })}
                            </Select>
                            <Button variant="contained" color="primary"  size="large" style={
                                { float: "right", display: "flex"}} onClick={e => {
                                    setDisplay(prevState => lodash.merge(prevState, {
                                        [host]: {
                                            [port]: {
                                                devices: {
                                                    [domain]: {
                                                        [family]: {
                                                            [member]: {
                                                                attributes: {
                                                                    [newAttr]: {
                                                                        value: true
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }) )
                            }}>+</Button>
                        </FormControl> : <></>
                        }

                    </CardContent>
                    {/*<CardActions>*/}
                    {/*
                    {/*</CardActions>*/}
                </Card>
            </Rnd>


        })}



        {/*<div style={{position: "absolute"}} >*/}
        {/*    TEST*/}
        {/*</div>*/}





        {/*<svg ref={drop} width={"1100px"} height={"950px"}   style={{border: "3px solid black"}}>*/}
        {/*    {devices.map(device => {*/}
        {/*        const xP = device.geometry.x * 100*/}
        {/*        const yP = device.geometry.y * 100*/}
        {/*        const wP = device.geometry.w * 100*/}
        {/*        const hP = device.geometry.h * 100*/}
        {/*        console.log(xP, yP, wP, hP)*/}
        {/*        return <rect*/}
        {/*            key={`${device.reference.host}-${device.reference.path}`}*/}
        {/*            x={`${xP}%`} y={`${yP}%`} width={`${wP}%`} height={`${hP}%`} fill={"red"}/>*/}
        {/*    })}*/}
        {/*</svg>*/}
    </div>
}

