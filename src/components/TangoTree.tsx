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

export function DraggableTreeItem(props: {nodeId: string, label: string, server: string}) {
    const [_, drag] = useDrag({
       item: { id: props.nodeId, type: ItemTypes.TREE_ITEM, server: props.server},
    })
    return <TreeItem ref={drag}
        nodeId={props.nodeId} label={props.label} />
}

export default function MultiSelectTreeView() {
    const selector = TangoController.selector
    const {loadPath, loadStructure, addServer} = TangoController.actions

    const [newPort, setNewPort] = useState<number>(10000)
    const [newHost, setNewHost] = useState("tango-cs")
    const [selectedServer, setSelectedServer] = useState<string>("")

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
                            <Create style={{height: "100%"}} onClick={e => {addServer({host: newHost, port: newPort})}} />
                        </div>
                        <Select onChange={e => {
                            const key = e.target.value as string
                            if (Object.keys(selector.servers[key].domains).length === 0) {
                                loadStructure({key})
                            }
                            setSelectedServer(key)
                        }}>
                            {Object.entries(selector.servers).map(entry => {
                                const [key, server] = entry
                                return <MenuItem value={key}>
                                    {`${server.host}:${server.port}`}<Delete onClick={console.log} />
                                </MenuItem>
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
                        // onNodeToggle={console.log}
                        // onNodeSelect={console.log}
                        // multiSelect
                    >
                        {
                            selector.servers.hasOwnProperty(selectedServer)? <>
                                {
                                    Object.entries(selector.servers[selectedServer].domains).map(domainEntry => {
                                        const [domainKey, domain] = domainEntry
                                        return <TreeItem nodeId={domainKey} label={domainKey} >
                                            {Object.entries(domain).map(familyEntry => {
                                                const [familyKey, family] = familyEntry
                                                return <TreeItem
                                                    nodeId={`${domainKey}/${familyKey}`} label={familyKey} >{
                                                    Object.entries(family).map(memberEntry => {
                                                        const [memberKey, member] = memberEntry
                                                        return <DraggableTreeItem
                                                            server={selectedServer}
                                                            nodeId={`${domainKey}/${familyKey}/${memberKey}`}
                                                            label={memberKey}
                                                        />
                                                    })}
                                                </TreeItem>
                                            })}
                                        </TreeItem>
                                    })
                                }
                            </> : <></>
                        }
                    </TreeView>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </>
    );
}