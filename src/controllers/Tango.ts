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
        load: this.createAsyncAction<Selector, {diff: any, paths: {inputs: Array<ApiPoint<any>>, outputs: Array<ApiPoint<any>>}}>({

            action: async (input, api) => {

                const delayMs = 5000 // TODO: remove hardcode
                const now = (new Date()).getTime()

                const state = (api.getState() as any)[this.name] as TangoState

                const pathMatchSelector = (path: string, selector: Selector) => {
                    const checkStep = (parts: Array<String>, slice: any): boolean => {
                        const part = parts[0]
                        for(const entry in slice) {
                            if(part === entry || entry === "*") {
                                if(parts.length === 1)
                                    return true
                                // if(typeof slice[entry] !== "object" )
                                //     return false
                                if(checkStep(parts.slice(1), slice[entry])) {
                                    return true
                                }
                            }
                        }
                        return false
                    }
                    return checkStep(path.split("/"), selector)
                }


                const findOutputs = (slice: any, path: string): Array<ApiPoint<any>> => {
                    let outputs: Array<ApiPoint<any>> = []
                    if(typeof slice === "object" && slice !== null) {
                        Object.keys(slice).forEach(key => {
                            if(slice[key].hasOwnProperty("_links")) {
                                delete slice[key]["_links"]
                            }
                            const value = slice[key]
                            if(typeof value === "object") {
                                if(value.hasOwnProperty("__api__")) {
                                    outputs.push(value as ApiPoint<any>)
                                } else {
                                    outputs.push(...findOutputs(value, `${path}/${key}`))
                                }
                            } else if(typeof value === "string" && value.startsWith("http")) {
                                slice[key] = {
                                    error: null,
                                    value: null,
                                    __api__: {
                                        updated: 0,
                                        path: `${path}/${key}`
                                    }
                                }
                                outputs.push(slice[key])
                            }
                        })
                    }
                    return outputs
                }

                // Object.entries(input).forEach( entry => {
                //     const [host, ports] = entry
                //     Object.entries(ports).forEach( portEntry => {
                //         const [port, value] = portEntry
                //         if(!state.servers.hasOwnProperty(host)) {
                //             state.servers[host] = {}
                //         }
                //         if(!state.servers[host].hasOwnProperty(port)) {
                //             state.servers[host][Number(port)] = {
                //                 error: null,
                //                 value: null,
                //                 __api__: {
                //                     updated: 0
                //                 }
                //             }
                //         }
                //     })
                // })
                const apiUrl = new URL(`hosts/`, genTangoURL(state.restApiUrl)).href

                const processPath = async (input: string): Promise<{input?: ApiPoint<any>, outputs:Array<ApiPoint<any>>}> => {

                    const existed = _.at(
                        state as any, input.replace("/", "."))[0] as ApiPoint<any>
                    const good = typeof existed !== "undefined" &&
                        existed.value !== null && (now - existed.__api__.updated) < delayMs
                    if (good) {
                        return { input: null, outputs: findOutputs(existed.value, existed.__api__.path)}
                    } else {
                        const url = new URL(input, apiUrl).href
                        const resp = await (
                            await fetch(url, {headers: {Authorization: state.authHeader}})).json()

                        if(Array.isArray(resp)) {

                            const data: {[key: string]: any }= {}

                            let outputs: Array<ApiPoint<any>> = []

                            resp.forEach(res => {
                                const parts = res.name.split("/")
                                if(parts.length > 1) {
                                    let curSlice = data as any
                                    let curPath = input

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
                                        outputs.push(curSlice[parts[parts.length - 1]])
                                    }
                                } else {
                                    if(res.hasOwnProperty("_links")) {
                                        delete res["_links"]
                                    }
                                    data[res.name] = res
                                    outputs.push(...findOutputs(data[res.name],`${input}/${res.name}`))
                                }
                            })
                            return {
                                input: {
                                    error: null,
                                    value: data,
                                    __api__: {
                                        path: input,
                                        updated: now
                                    }
                                }, outputs
                            }
                        } else {
                            if(resp.hasOwnProperty("_links")) {
                                delete resp["_links"]
                            }
                            const outputs = findOutputs(resp, input)
                            return {
                                input: {
                                    error: null,
                                    value: resp,
                                    __api__: {
                                        path: input,
                                        updated: 0,
                                    }
                                }, outputs
                            }
                        }
                    }
                }


                let inputs: Array<ApiPoint<any>> = []
                let outputs: Array<ApiPoint<any>> = []

                await Promise.all(Object.entries(input).map(async entry => {
                    const [host, ports] = entry
                    await Promise.all(Object.entries(ports).map(async portEntry => {
                        const [port, value] = portEntry
                        const processOutput = async (path: string) => {
                            if(pathMatchSelector(path, input)) {
                                const res = await processPath(path)
                                if(res.input !== null) {
                                    inputs.push(res.input)
                                    outputs.push(...res.outputs)
                                }
                                await Promise.all(res.outputs.map(async output => {
                                    await processOutput(output.__api__.path)
                                }))
                            }
                        }
                        await processOutput(`${host}/${port}`)
                    }))
                }))

                let coupledPaths: Array<string> = []
                outputs.forEach(output => {
                    inputs.forEach(input => {
                        if (coupledPaths.includes(output.__api__.path) || coupledPaths.includes(input.__api__.path))
                            return
                        if(output.__api__.path === input.__api__.path) {
                            console.log(output.__api__.path)
                            coupledPaths.push(output.__api__.path)
                            output.__api__ = input.__api__
                            output.value = input.value
                            output.error = input.error
                        }
                    })
                })

                let paths: {inputs: Array<ApiPoint<any>>, outputs: Array<ApiPoint<any>>} = {
                    inputs: inputs.filter(input => !coupledPaths.includes(input.__api__.path)),
                    outputs: outputs.filter(output => !coupledPaths.includes(output.__api__.path))
                }


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

                const process = async (subState: any, subSelector: any, url: any) => {

                    if((subState.value === null && subState.error === null) ||
                        subState.value && ((new Date()).getTime() - subState.__api__.updated) > delayMs) {

                        const resp = await (
                            await fetch(url, {headers: {Authorization: state.authHeader}})).json()

                        if(typeof resp === "object" && resp.hasOwnProperty("_links")) {
                            delete resp["_links"]
                        } else if(Array.isArray(resp)) {
                            resp.forEach(element => {
                                if(typeof element === "object" && element.hasOwnProperty("_links")) {
                                    delete element.link
                                }
                            })
                        }

                        const changeContent = (subState: any, resp: any) => {
                            _.mergeWith(subState, resp,(objValue, srcValue) => {
                                if(typeof srcValue ===  "string" && srcValue.startsWith("http://")) {
                                    if(typeof objValue === "object" && objValue.hasOwnProperty("__api__")) {
                                        return objValue
                                    } else {
                                        return {
                                            value: null,
                                            error: null,
                                            __api__: {
                                                updated: 0
                                            }
                                        }
                                    }
                                } else {
                                    return srcValue
                                }
                            })
                        }

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
                                        // if(!subState.value.hasOwnProperty(r.name)) {
                                        //     subState.value[r.name] = {}
                                        // }
                                        // changeContent(subState.value[r.name], r)
                                    })
                                }
                            }
                            subState.__api__.updated = (new Date()).getTime()
                        } else {
                            if(subState.value === null)
                                subState.value = {}
                            // console.log(subState.value)
                            // changeContent(subState.value, resp)
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

                return {diff, paths}
            },
            fulfilled(state, action) {

                Object.keys(action.meta.arg).forEach(host => {
                    Object.keys(action.meta.arg[host]).forEach(port => {
                        if(!state.servers.hasOwnProperty(host)) {
                            state.servers[host] = {}
                        }
                        if(!state.servers[host].hasOwnProperty(port)) {
                            state.servers[host][Number(port)] = {
                                value: null,
                                error: null,
                                __api__: {
                                    updated: 0,
                                    path: `${host}/${port}`
                                }
                            }
                        }
                    })
                })

                action.payload.paths.outputs.forEach(output => {
                    const extInput = (_.at(state.servers, output.__api__.path.replace("/","."))[0] as any) as ApiPoint<any>
                    if(extInput != undefined) {
                        output.__api__ = extInput.__api__
                        output.value = extInput.value
                        output.error = extInput.error
                    }
                })

                action.payload.paths.outputs.forEach(input => {
                    const extOutput = (_.at(state.servers, input.__api__.path.replace("/","."))[0] as any) as ApiPoint<any>
                    if(extOutput != undefined) {
                        input.__api__ = extOutput.__api__
                        input.value = extOutput.value
                        input.error = extOutput.error
                    }
                })

                return _.merge({}, state)


                // console.log(action.payload.paths)
                // action.payload.paths.forEach(path => {
                //    path.
                // })

                // console.log((action.payload as any).paths)
                // console.log(state, (action.payload as any).diff)
                // return _.merge((action.payload as any).diff, state)
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

