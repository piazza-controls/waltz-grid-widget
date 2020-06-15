import * as React from "react";
import { useDrop } from 'react-dnd'
import {DraggableTreeItem, ItemTypes} from "./TangoTree";
import {DropTargetMonitor} from "react-dnd/lib/interfaces/monitors";
import {useRef, useState} from "react";


declare interface Device {
    geometry: {
        x: number,
        y: number,
        w: number,
        h: number,
    }

    reference: {
        host: string
        path: string
    }
}

export default function() {

    const el = useRef(null);
    const [devices, setDevices] = useState<Array<Device>>([])

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
                    host: (item as any).server,
                    path: (item as any).id
                }
            }
            // console.log(setDevices, devices, [...devices, device])
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

