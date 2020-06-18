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
    path?: string // TODO: make required
    outputs?: Array<string> // TODO: make required
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
        load: this.createAsyncAction<Selector, Array<Array<ApiPoint<any>>>>({

            action: async (input, api) => {

                const delayMs = 5000 // TODO: remove hardcode
                const now = (new Date()).getTime()
                const state = (api.getState() as any)[this.name] as TangoState
                const apiUrl = new URL(`hosts/`, genTangoURL(state.restApiUrl)).href

                const pathMatchSelector = (path: string, selector: Selector) => {
                    const checkStep = (parts: Array<string>, slice: any): boolean => {
                        const part = parts[0]
                        for(const entry in slice) {
                            if(part === entry || entry === "*") {
                                if(parts.length === 1)
                                    return true
                                if(checkStep(parts.slice(1), slice[entry])) {
                                    return true
                                }
                            }
                        }
                        return false
                    }
                    return checkStep(path.split("/"), selector)
                }

                const findOutputs = (slice: any, path: string): Array<string> => {
                    let outputs: Array<string> = []
                    if(typeof slice === "object" && slice !== null) {
                        Object.keys(slice).forEach(key => {
                            if(slice[key].hasOwnProperty("_links")) {
                                delete slice[key]["_links"]
                            }
                            const value = slice[key]
                            if(typeof value === "object") {
                                if(value.hasOwnProperty("__api__")) {
                                    outputs.push(value.__api__.path)
                                } else {
                                    outputs.push(...findOutputs(value, `${path}/${key}`))
                                }
                            } else if(typeof value === "string" && value.startsWith("http")) {
                                slice[key] = {
                                    error: null,
                                    value: {},
                                    __api__: {
                                        updated: 0,
                                        path: `${path}/${key}`
                                    }
                                }
                                outputs.push(slice[key].__api__.path)
                            }
                        })
                    }
                    return outputs
                }


                const processPath = async (path: string): Promise<ApiPoint<any>> => {

                        const url = new URL(path, apiUrl).href
                        const resp = await (
                            await fetch(url, {headers: {Authorization: state.authHeader}})).json()

                        if(Array.isArray(resp)) {
                            const data: {[key: string]: any }= {}
                            let outputs: Array<string> = []
                            resp.forEach(res => {
                                const parts = res.name.split("/")
                                if(parts.length > 1) {
                                    let curSlice = data as any
                                    let curPath = path

                                    parts.slice(0, parts.length - 1).forEach((part: string) => {
                                        if (!curSlice.hasOwnProperty(part)) {
                                            curSlice[part] = {}
                                        }
                                        curSlice = curSlice[part]
                                        curPath = `${curPath}/${part}`
                                    })

                                    if (res.hasOwnProperty("href")) {
                                        curSlice[parts[parts.length - 1]] = {
                                            error: null,
                                            value: null,
                                            __api__: {
                                                updated: 0,
                                                path: `${curPath}/${parts[parts.length - 1]}`
                                            }
                                        }
                                        outputs.push(`${curPath}/${parts[parts.length - 1]}`)
                                    }
                                } else {
                                    if(res.hasOwnProperty("_links")) {delete res["_links"]}
                                    data[res.name] = res
                                    outputs.push(...findOutputs(data[res.name],`${path}/${res.name}`))
                                }
                            })
                            return {
                                    error: null,
                                    value: data,
                                    __api__: {
                                        path: path,
                                        updated: now,
                                        outputs: outputs
                                    }
                            }
                        } else {
                            if(resp.hasOwnProperty("_links")) {
                                delete resp["_links"]
                            }
                            const outputs = findOutputs(resp, path)
                            return {
                                error: null,
                                value: resp,
                                __api__: {
                                    path: path,
                                    outputs,
                                    updated: now,
                            }
                        }
                    }
                }


                const iteration = async (paths: Array<string>): Promise<{points: Array<ApiPoint<any>>, next: Array<string>}> => {

                    if(paths.length === 0) {
                        return {points: [], next: []}
                    }

                    let next: Array<string> = []
                    let points: Array<ApiPoint<any>> = []

                    await Promise.all(paths.map(async path => {
                        let point: ApiPoint<any> = _.at(state.servers as any, path.replace("/","."))[0]
                        if(typeof point !== "undefined") {
                            // if(point.__api__.updated ) // TODO: add checking
                            next.push(...point.__api__.outputs.filter(output => pathMatchSelector(output, input)))
                        } else {
                            point = await processPath(path)
                            next.push(...point.__api__.outputs.filter(output => pathMatchSelector(output, input)))
                            points.push(point)
                        }
                    }))

                    if(points.length === 0) {
                        return await iteration(next)
                    } else {
                        return {points, next}
                    }
                }

                const getInitialPaths = () => {
                    let paths: Array<string> = []
                    Object.keys(input).forEach(host => {
                        Object.keys(input[host]).forEach(port => {
                            const path = `${host}/${port}`
                            paths.push(path)
                        })
                    })
                    return paths
                }

                let iters: Array<Array<ApiPoint<any>>> = []
                let paths = getInitialPaths()

                while (true) {
                    const {points, next} = await iteration(paths)
                    iters.push(points)
                    paths = next
                    if(next.length === 0)
                        break
                }

                return  iters
            },
            fulfilled(state, action) {

                action.payload.forEach(iter => {

                    const pathToSelector = (path: string): string =>  {
                        const parts = path.split("/")
                        if(parts.length > 2) {
                            parts[1] = `${parts[1]}.value`
                        }
                        if(parts.length > 3) {
                            parts[2] = `${parts[2]}.value`
                        }
                        if(parts.length > 6) {
                            parts[5] = `${parts[5]}.value`
                        }
                        if(parts.length > 7) {
                            parts[6] = `${parts[6]}.value`
                        }
                        return parts.join(".")
                    }

                    iter.forEach(it => {
                        console.log(it.__api__.path)
                        if(it.__api__.path.split("/").length === 2) {
                            const [host, port] = it.__api__.path.split("/")
                            _.merge(state.servers, {[host]: {[port]: {}}})
                        }
                        let sel = _.at(state.servers, pathToSelector(it.__api__.path))[0]
                        _.merge(sel, it)
                    })
                })
                return state
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

