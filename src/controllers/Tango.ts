import {ReduxStoreController, registerController} from "waltz-base";
import AuthController, {ApiType, AuthState, AuthStatus} from "./Authorization";
import {genTangoURL, getAbsHost} from "../utils";
import * as _ from "lodash"

export declare interface Failure {
    errors: Array<{
        reason: string  // TODO: enum
        description: string
        severity: string // TODO: enum
        origin: string }>
    quality: string, // TODO: enum
    timestamp: number
}

export declare interface ApiInfo {
    updated: number
}

export declare interface ApiPoint<T> {
    error?: Failure
    value?: T
    __api__: ApiInfo
}

export declare interface TangoState {
    restApiUrl?: string
    status: AuthStatus
    authHeader?: string
    servers: {[host: string]: {
            [port: number]: ApiPoint<ServerEntry>
        }
    }
}

export declare interface Grouping {
    [domain: string]: {
        [family: string]: {
            [member: string]: ApiPoint<Member>
        }
    }
}

export declare interface ServerEntry {
    name: string
    host: string
    port: number // TODO: String?
    info: Array<string>
    devices: ApiPoint<Grouping>
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
    value: ApiPoint<AttributeValue>
    info: ApiPoint<AttributeInfo>
    properties?: ApiPoint<{[key: string]: Property}> // TODO need null?
    history: ApiPoint<Array<AttributeValue>>
}

export declare interface Pipe {
    name: string,
    size: number,
    timestamp: number,
    data: { [key: string]: Array<string|number> }
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
    attributes: ApiPoint<{ [name:string]: Attribute|null }>
    commands: ApiPoint<{ [name:string]: Command|null }>
    pipes: ApiPoint<{ [name:string]: Pipe|null }>
    properties: ApiPoint<{ [name:string]: Property|null }>
    state: ApiPoint<State>
}

export type Selector = {
    [host: string]: {
        [port: string]: {
            devices: {
                [domain: string]: {
                    [family: string]: {
                        [member: string]: {
                            attributes?: {
                                [name: string]: {
                                    value?: boolean
                                    info?: boolean
                                    properties?: {
                                        [name: string]: boolean
                                    }
                                    history?: boolean
                                }
                            },
                            commands?: {
                                [name: string]: {
                                    history?: boolean
                                }
                            },
                            pipes?: {
                                [name: string]: boolean
                            }
                            properties?: {
                                [name: string]: boolean
                            }
                            state?: boolean
                        }
                    }
                }
            }
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
        load: this.createAsyncAction<Selector, Array<{path:string, data: {}}>>({

            action: async (input, api) => {

                const delayMs = 5000 // TODO: remove hardcode

                const state = (api.getState() as any)[this.name] as TangoState
                const diff: any = {}
                const validator = (path: Array<string>): ProxyHandler<any> => ({
                    get(target, key) {
                        if (typeof target[key] === 'object' && target[key] !== null) {
                            return new Proxy<any>(target[key], validator([...path, key as string]))
                        } else {
                            return target[key];
                        }
                    },
                    set (target, key, value) {
                        let diffPart = diff
                        path.forEach(part => {
                            if(!diffPart.hasOwnProperty(part)) {
                                diffPart[part] = {}
                            }
                            diffPart = diffPart[part]
                        })
                        diffPart[key] = value
                        target[key] = value
                        return true
                    }
                })
                const proxyState = new Proxy<TangoState>(state, validator([]))
                const apiUrl = new URL(`hosts/`, genTangoURL(proxyState.restApiUrl)).href

                const process = async (subState: any, subSelector: any, url: any) => {

                    if((subState.value === null && subState.error === null) ||
                        subState.value && ((new Date()).getTime() - subState.__api__.updated) > delayMs) {

                        const resp = await (
                            await fetch(url, {headers: {Authorization: state.authHeader}})).json()

                        const changeLinks = (subState: any, resp: any) =>  {
                            Object.keys(resp).forEach(key => {
                                if((typeof resp[key] === "string" && resp[key].startsWith("http"))) {
                                    const alreadyHasLink = subState !== null &&
                                        subState.hasOwnProperty(key) &&
                                        subState[key].hasOwnProperty("__api__") && false // TODO: fix
                                    if(alreadyHasLink) {
                                        delete resp[key]
                                        resp[key] = subState[key]
                                    } else {
                                        resp[key] = {
                                            value: null,
                                            error: null,
                                            __api__: {
                                                updated: 0
                                            }
                                        }
                                    }
                                } else if (typeof resp[key] === "object") {
                                    changeLinks(subState === null? null: subState[key], resp[key])
                                }
                            })
                        }

                        // TODO catch error

                        if(Array.isArray(resp)) {

                            if(subState.value === null) {
                                subState.value = {}
                            }

                            if(resp[0].hasOwnProperty("name")) {
                                if(resp[0].hasOwnProperty("href")) {
                                    resp.forEach(r => {
                                        const parts = r.name.split("/")
                                        let subSubState = subState.value
                                        parts.slice(0, parts.length - 1).forEach((part: string) => {
                                            if(!subSubState.hasOwnProperty(part)) {
                                                subSubState[part] = {}
                                            }
                                            subSubState = subSubState[part]
                                        })
                                        if(!subSubState.hasOwnProperty(parts[parts.length - 1])) {
                                            subSubState[parts[parts.length - 1]] = {
                                                error: null,
                                                value: null,
                                                __api__: {
                                                    updated: 0
                                                }
                                            }
                                        }
                                    })
                                } else {
                                    resp.forEach(r => {
                                        changeLinks(
                                            subState.value.hasOwnProperty(r.name)?
                                                subState.value[r.name]: null, r)
                                        subState.value[r.name] = r
                                    })
                                }
                            }
                            subState.__api__.updated = (new Date()).getTime()
                        } else {
                            changeLinks(subState.value, resp)
                            subState.value = resp
                            subState.__api__.updated = (new Date()).getTime()
                        }
                    }

                    const findApi = async (subState: any, subSelector: any, url: string) => {
                        const keys = Object.keys(subSelector)
                        await Promise.all(Object.entries(subState).map(async entry => {
                            const [key, value] = entry
                            const haveStar = keys.includes("*")
                            if(keys.includes(key) || haveStar) {
                                if(typeof value === "object") {
                                    if(value.hasOwnProperty("__api__")) {
                                        await process(subState[key], subSelector[haveStar? "*": key],
                                            new URL(key, `${url}/`).href)
                                    } else {
                                        await findApi(subState[key], subSelector[haveStar? "*": key],
                                            new URL(key, `${url}/`).href)
                                    }
                                }
                            }
                        }))
                    }

                    await findApi(subState.value, subSelector, url)
                }

                let servers: Array<{name: string, href: string}> = []


                await Promise.all(Object.entries(input).map(async entry => {
                    const [host, ports] = entry
                    await Promise.all(Object.entries(ports).map( async portEntry => {
                        const [port, value] = portEntry
                        if(!proxyState.servers.hasOwnProperty(host)) {
                            proxyState.servers[host] = {}
                        }
                        if(!proxyState.servers[host].hasOwnProperty(port)) {
                            proxyState.servers[host][Number(port)] = {
                                error: null,
                                value: null,
                                __api__: {
                                    updated: 0
                                }
                            }
                        }
                        await process(
                            proxyState.servers[host][Number(port)],
                            input[host][port],
                            new URL(`${host}/${port}`, apiUrl).href)
                    }))
                }))

                return diff
            },
            fulfilled(state, action) {
                console.log(state, action.payload)
                return _.merge(action.payload, state)
            },
            rejected(state, action) {
                console.log(action)
            }
        }),
    };
    selectors: {}
}

const controller = new TangoController()
registerController(controller)
export default controller

