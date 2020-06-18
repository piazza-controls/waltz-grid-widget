import * as React from 'react';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import TangoController from "../controllers/Tango";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Delete from "@material-ui/icons/Delete";
import Create from "@material-ui/icons/Create";
import TextField from "@material-ui/core/TextField";
import {useState} from "react";
import Divider from "@material-ui/core/Divider";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";

import { useDrag } from 'react-dnd'

export enum ItemTypes {
    TREE_ITEM = "TREE_ITEM"
}

export function DraggableTreeItem(props: {nodeId: string, label: string, host: string, port: number}) {
    const [_, drag] = useDrag({
       item: {
           id: props.nodeId,
           type: ItemTypes.TREE_ITEM,
           host: props.host,
           port: props.port
       },
    })
    return <TreeItem ref={drag}
        nodeId={props.nodeId} label={props.label} />
}

export default function MultiSelectTreeView() {
    const selector = TangoController.selector
    const {load} = TangoController.actions

    console.log(selector)

    const [newPort, setNewPort] = useState<number>(10000)
    const [newHost, setNewHost] = useState("tango-cs")
    const [selServer, setSelectedServer] = useState<{host: string, port: number}>(null)

    console.log(selector.servers)
    console.log(selServer)

    return (
        <>
            <Divider />
            <ExpansionPanel square>
                <ExpansionPanelSummary>
                    <Typography>Servers</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <FormControl>
                        <div>
                            <TextField label="Host" type="string" inputProps={{size: 10}}
                                       value={newHost} onChange={e => setNewHost(e.target.value)} />
                            <TextField label="Port" type="number" inputProps={{size: 7}}
                                       value={newPort} onChange={e => setNewPort(Number(e.target.value))}/>
                            {/*           TODO: CSS */}
                            <Create style={{height: "100%"}} onClick={

                                e => {
                                    load({[newHost]: {[Number(newPort)]: {devices: {}}}})
                                }
                            } />
                        </div>
                        <Select onChange={e => {
                            const key = e.target.value as string
                            const [host, port] =  key.split(":")
                            setSelectedServer({host, port: Number(port)})
                        }}>
                            {Object.entries(selector.servers).map(entry => {
                                const [host, value] = entry
                                return Object.entries(value).map(entry => {
                                    const [port, server] = entry
                                    return <MenuItem value={`${host}:${port}`}>
                                        {`${host}:${port}`}<Delete onClick={console.log} />
                                    </MenuItem>
                                })
                            })}
                        </Select>
                    </FormControl>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <Divider/>
            <ExpansionPanel style={{maxHeight: "40vh", overflow: "scroll"}} square>
                <ExpansionPanelSummary>
                    <Typography>Device Tree</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <TreeView
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                    >
                        {
                            selServer !== null &&
                            selector.servers.hasOwnProperty(selServer.host) &&
                            selector.servers[selServer.host].hasOwnProperty(selServer.port) &&
                            selector.servers[selServer.host][selServer.port].value !== null &&
                            selector.servers[selServer.host][selServer.port].value.devices.value !== null ? <>
                                {
                                    Object.entries(selector.servers[selServer.host][selServer.port].value.devices.value).map(
                                        domainEntry => {
                                            console.log(domainEntry)
                                        const [domainKey, domain] = domainEntry
                                        return <TreeItem nodeId={domainKey} label={domainKey} >
                                            {Object.entries(domain).map(familyEntry => {
                                                const [familyKey, family] = familyEntry
                                                return <TreeItem
                                                    nodeId={`${domainKey}/${familyKey}`} label={familyKey} >{
                                                    Object.entries(family).map(memberEntry => {
                                                        const [memberKey, member] = memberEntry
                                                        return <DraggableTreeItem
                                                            host={selServer.host}
                                                            port={selServer.port}
                                                            nodeId={`${domainKey}/${familyKey}/${memberKey}`}
                                                            label={memberKey}
                                                        />
                                                    })}
                                                </TreeItem>
                                            })}
                                        </TreeItem>
                                    })
                                }
                            </> :
                                <></>
                        }
                    </TreeView>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </>
    );
}