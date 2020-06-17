import * as React from "react";
import { useDrop } from 'react-dnd'
import {ItemTypes} from "./TangoTree";
import {DropTargetMonitor} from "react-dnd/lib/interfaces/monitors";
import {useEffect, useRef, useState} from "react";
import TangoController from "../controllers/Tango";


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
}

export default function() {

    const el = useRef(null);
    const [devices, setDevices] = useState<Array<Device>>([])
    const selector = TangoController.selector
    const {loadPath} = TangoController.actions

    useEffect(() => {
        const interval = setInterval(() => {
            devices.forEach(dev => {

                const {host, port} = dev.reference
                const [domain, family, member] = dev.reference.path.split("/")
                const servers = selector.servers

                const deviceLoaded = servers.hasOwnProperty(host) &&
                    servers[host].hasOwnProperty(port) &&
                    servers[host][port].devices !== null &&
                    servers[host][port].devices.hasOwnProperty(domain) &&
                    servers[host][port].devices[domain].hasOwnProperty(family) &&
                    servers[host][port].devices[domain][family].hasOwnProperty(member) &&
                    servers[host][port].devices[domain][family][member] !== null

                const attributesLoaded = deviceLoaded &&
                    servers[host][port].devices[domain][family][member].attributes !== null

                if (!deviceLoaded) {
                    loadPath(`${host}/${port}/devices/${domain}/${family}/${member}`)
                } else {
                    if(servers[host][port].devices[domain][family][member].info.exported) {
                        if(!attributesLoaded) {
                            loadPath(`${host}/${port}/devices/${domain}/${family}/${member}/attributes`)
                        }
                    }
                }
            })
            //
        }, 3000);
        return () => clearInterval(interval);
    }, [devices, selector]);

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
                    w: 0.05,
                    h: 0.05,
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


    return <div ref={el} style={{display: "inline-block"}}>
        <svg ref={drop} height={"500px"} width={"500px"}  style={{border: "3px solid black"}}>
            {devices.map(device => {
                const xP = device.geometry.x * 100
                const yP = device.geometry.y * 100
                const wP = device.geometry.w * 100
                const hP = device.geometry.h * 100
                console.log(xP, yP, wP, hP)
                return <rect
                    key={`${device.reference.host}-${device.reference.path}`}
                    x={`${xP}%`} y={`${yP}%`} width={`${wP}%`} height={`${hP}%`} fill={"red"}/>
            })}
        </svg>
    </div>
}

