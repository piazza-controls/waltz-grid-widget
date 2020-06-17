import {ReduxStoreController, registerController} from "waltz-base";
import AuthController, {ApiType, AuthState, AuthStatus} from "./Authorization";
import {genTangoURL, getAbsHost} from "../utils";
import {TangoDevice} from "../api/tango";

export declare interface Failure {
    errors: Array<{
        reason: string  // TODO: enum
        description: string
        severity: string // TODO: enum
        origin: string }>
    quality: string, // TODO: enum
    timestamp: number
}

export declare interface Command {
    cmd_name: string,
    level: string, // TODO: enum
    cmd_tag: number,
    in_type: string, // TODO: enum
    out_type: string, // TODO: enum
    in_type_desc: string
    out_type_desc: string
    history?: any // TODO: add
}

export declare interface AttributeValue {
    name: string,
    value: string | number
    quality: string // TODO: enum
    timestamp: number
}

export declare interface Attribute {
    name: string,
    value?: AttributeValue,
    info?: AttributeInfo
    properties?: Map<string, Property|null> // TODO need null?
    history?: Array<AttributeValue>
}

export declare interface Pipe {
    name: string,
    size: number,
    timestamp: number,
    data: Map<string, Array<string|number>>
}

export declare interface Property {
    name: string,
    values: Array<string>
}

export declare interface State {
    state: string // TODO: enum?
    status: string
}

export declare interface AttributeInfo {
    name: string,
    writable: string, // TODO: enum,
    data_format: string, // TODO: enum,
    data_type: string, // TODO: enum,
    max_dim_x: number,
    max_dim_y: number,
    description: string,
    label: string,
    unit: string,
    standard_unit: string, // "No standard unit"
    display_unit: string, // "No display unit"
    format: string, // "Not specified"
    min_value: string, // "Not specified"
    max_value: string, // "Not specified"
    min_alarm: string, // "Not specified"
    max_alarm: string, // "Not specified"
    writable_attr_name: string,
    level: string, // TODO: enum,
    extensions: Array<any>

    alarms: {
        min_alarm: string // "Not specified"
        max_alarm: string // "Not specified"
        min_warning: string // "Not specified"
        max_warning: string // "Not specified"
        delta_t: string // "Not specified"
        delta_val: string // "Not specified"
        extensions: Array<any>
        tangoObj: {} // TODO: Add
    }

    events: {
        ch_event: {
            rel_change: string // "Not specified"
            abs_change: string // "Not specified"
            extensions: Array<any>
            tangoObj: {} // TODO: Add
        },
        per_event: {
            period: number,
            extensions: Array<any>
            tangoObj: {} // TODO: Add
        },
        arch_event: {
            rel_change: string // "Not specified"
            abs_change: string // "Not specified"
            period: string // "Not specified"
            extensions: []
            tangoObj: {} // TODO: Add
        },
        tangoObj: {} // TODO: Add
    },
    sys_extensions: Array<any>,
    isMemorized: boolean
    isSetAtInit: boolean
    memorized: string // TODO: enum
    root_attr_name: string // "Not specified"
    enum_label: Array<any>
}

export declare interface Member {
    name: string,
    info: {
        last_exported: string // TODO: time
        last_unexported: string // TODO: time
        name: string
        ior: string,
        version: number,
        exported: boolean,
        pid: number,
        server: string,
        hostname: string,
        classname: string,
        is_taco: boolean
    },
    attributes?: { [name:string]: Attribute|null }
    commands?: { [name:string]: Command|null }
    pipes?: { [name:string]: Pipe|null }
    properties?: { [name:string]: Property|null }
    state?: State
}

export declare interface ServerEntry {
    name: string
    host: string
    port: number // TODO: String?
    info: Array<string>
    devices?: {
        [domain: string]: {
            [family: string]: {
                [member: string]: Member|null
            }
        }
    }
}

export declare interface TangoState {
    restApiUrl?: string
    status: AuthStatus
    authHeader?: string
    servers: {[host: string]: {
            [port: number]: ServerEntry|null
        }
    }
}

export class TangoController extends ReduxStoreController<TangoState> {

    name: string;
    initialState = {
        status: AuthStatus.NOT_LOGGED,
        servers: {}
    };

    mappers = {
        grabConnections: this.createMapper<AuthState, AuthState>({
            source: AuthController,
            from: state => {
                return state
            },
            to: (state, action) => {

                if(action.payload.api !== ApiType.TANGO) {
                    state = {
                        status: AuthStatus.API_MISMATCH,
                        servers: {}
                    }
                    return state
                } else {
                    if (state.restApiUrl === action.payload.host) {
                        if(state.status === AuthStatus.LOGGED) {
                            const {status, authHeader} = action.payload
                            state = {...state, status, authHeader}
                            return state
                        } else {
                            const { host, status, authHeader} = action.payload
                            state = {restApiUrl: host, status, authHeader, servers: {}}
                            return state
                        }
                    } else {
                        const { host, status, authHeader} = action.payload
                        state = {restApiUrl: host, status, authHeader, servers: {}}
                        return state
                    }
                }
            }
        })
    }
    actions = {
        addServer: this.createAction<{host: string, port: number}>({
            action: (state, action) => {
                const {host, port} = action.payload
                if(!state.servers.hasOwnProperty(host)) state.servers[host] = {}
                if(!state.servers[host].hasOwnProperty(port)) state.servers[host][port] = null
            }
        }),
        loadPath: this.createAsyncAction<string, Array<{path:string, data: {}}>>({
            action: async (input, api) => {

                const fetched: Array<{path: string, data: {}}> = []

                const state = (api.getState() as any)[this.name] as TangoState

                const parts = input.split("/")

                if (parts.length >= 2) {
                    const [host, port] = [parts[0], Number(parts[1])]
                    const apiUrl = new URL(`hosts/${host}/${port}/`, genTangoURL(state.restApiUrl)).href

                    const stateHasServerInfo = (state.servers.hasOwnProperty(host) &&
                        state.servers[host].hasOwnProperty(port) &&
                        state.servers[host][port] !== null)

                    if(!stateHasServerInfo || parts.length === 2) {

                        const serverResp =  await (
                            await fetch(apiUrl, {headers: {Authorization: state.authHeader}})).json()

                        fetched.push({path: `${host}/${port}`, data: serverResp})
                        if (serverResp.hasOwnProperty("quality") && serverResp.quality === "FAILURE") {
                            return fetched
                        }
                        if(parts.length === 2) {
                            return fetched
                        }
                    }

                    if (parts.length >= 3) {
                        if(parts[2] !== "devices") {
                            throw new Error(`third path component should be "devices" instead of ${parts[2]}`)
                        }

                        const stateHasDevices = stateHasServerInfo? state.servers[host][port].devices !== null : false

                        const devicesUrl = new URL(`devices/`, apiUrl).href

                        if(!stateHasDevices || parts.length === 3) {

                            const devicesResp =  await (
                                await fetch(devicesUrl, {headers: {Authorization: state.authHeader}})).json()

                            fetched.push({path: `${host}/${port}/devices`, data: devicesResp})
                            if (devicesResp.hasOwnProperty("quality") && devicesResp.quality === "FAILURE") {
                                return fetched
                            }
                            if(parts.length === 3) {
                                return fetched
                            }
                        }

                        if(parts.length < 6) {
                            throw new Error("Unsupported path - it should have 2,3 or 6+ components")
                        }

                        const [domain, family, member] = parts.slice(3, 6)
                        const stateHasDevice = stateHasDevices?
                            state.servers[host][port].devices.hasOwnProperty(domain) &&
                            state.servers[host][port].devices[domain].hasOwnProperty(family) &&
                            state.servers[host][port].devices[domain][family].hasOwnProperty(member) &&
                            state.servers[host][port].devices[domain][family][member] !== null: false

                        const deviceUrl = new URL(`${domain}/${family}/${member}/`, devicesUrl).href

                        if(!stateHasDevice || parts.length === 6) {
                            const deviceResp =  await (
                                await fetch(deviceUrl, {headers: {Authorization: state.authHeader}})).json()

                            fetched.push({path: `${host}/${port}/devices/${domain}/${family}/${member}`,
                                data: deviceResp})
                            if (deviceResp.hasOwnProperty("quality") && deviceResp.quality === "FAILURE") {
                                return fetched
                            }

                            if(parts.length === 6) {
                                return fetched
                            }
                        }

                        if(parts.length === 7) {
                            switch (parts[6]) {
                                case "attributes":
                                {
                                    const attrsUrl = new URL(`attributes/`, deviceUrl).href
                                    const attrsResp =  await (
                                        await fetch(attrsUrl, {headers: {Authorization: state.authHeader}})).json()
                                    fetched.push({
                                        path: `${host}/${port}/devices/${domain}/${family}/${member}/attributes`,
                                        data: attrsResp
                                    })
                                    return fetched
                                }
                                case "commands":
                                case "pipes":
                                case "properties":
                                case "state":
                                    throw new Error("Not Implemented")
                                default:
                                    throw new Error("Unknown device property")
                            }
                        }

                        if (parts.length >= 7) {

                            // const stateHasDevices = stateHasServerInfo? state.servers[host][port].devices !== null : false
                            // const devicesUrl = new URL(`devices/`, apiUrl).href

                            throw new Error("Not implemented")
                        }

                    }

                } else {
                    throw new Error("Unsupported path - it should have 2,3 or 6+ components")
                }

            },
            fulfilled(state, action) {

                action.payload.forEach(entry => {
                    const {path, data} = entry
                    const parts = path.split("/")

                    switch (parts.length) {
                        case 2: {
                            const [host, port] = [parts[0], Number(parts[1])]
                            if (!state.servers.hasOwnProperty(host)) state.servers[host] = {}
                            // TODO: check overrides
                            const serverInfo = data as ServerEntry
                            state.servers[host][port] = {
                                host: serverInfo.host,
                                port: serverInfo.port,
                                info: serverInfo.info,
                                name: serverInfo.name,
                                devices: null,
                            }
                        }
                            break
                        case 3: {
                            const [host, port] = [parts[0], Number(parts[1])]

                            const devData = data as Array<{ name: string, href: string }>

                            const devices: {
                                [key: string]:
                                    { [key: string]: { [key: string]: Member | null } }
                            } = {}

                            devData.forEach(dev => {
                                const [domain, family, member] = dev.name.split("/")

                                if (!devices.hasOwnProperty(domain)) devices[domain] = {}
                                if (!devices[domain].hasOwnProperty(family)) devices[domain][family] = {}
                                devices[domain][family][member] = null
                            })

                            state.servers[host][port].devices = devices
                        }
                            break

                        case 6: {
                            const [host, port] = [parts[0], Number(parts[1])]
                            const [domain, family, member] = [parts[3], parts[4], parts[5]]

                            const devData = data as Member

                            state.servers[host][port].devices[domain][family][member] = {
                                name: devData.name,
                                info: devData.info,
                                attributes: null,
                                commands: null,
                                pipes: null,
                                properties: null,
                                state: null
                            }
                        }
                        break
                        case 7: {
                            const [host, port] = [parts[0], Number(parts[1])]
                            const [domain, family, member] = [parts[3], parts[4], parts[5]]
                            const prop = parts[6]
                            switch (prop) {
                                case "attributes":
                                {
                                    console.log(data)
                                    const attrsData = data as Array<Attribute>
                                    const attributes: {[name: string]: Attribute|null} = {}
                                    attrsData.forEach(attr => attributes[attr.name] = null)
                                    state.servers[host][port].devices[domain][family][member].attributes = attributes
                                }
                                break
                                case "commands":
                                case "pipes":
                                case "properties":
                                case "state":
                                    throw new Error("Not Implemented")
                                default:
                                    throw new Error("Unknown device property")
                            }
                        }
                        break
                        default:
                            throw new Error(`unexpected path ${path}`)
                    }
                })
                console.log(action)
            },
            rejected(state, action) {
                console.log(action)
            }
        })
    };
    selectors: {}
}

const controller = new TangoController()
registerController(controller)
export default controller

