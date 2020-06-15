import {ReduxStoreController, registerController} from "waltz-base";
import AuthController, {ApiType, AuthState, AuthStatus} from "./Authorization";
import {genTangoURL, getAbsHost} from "../utils";
import {
    Aliases,
    DeviceAttribute,
    DeviceCommand,
    DevicePipe, DeviceProperty, DeviceState,
    DevTree,
    TangoDevice,
    TangoDomain,
    TangoHost
} from "../api/tango";

export declare type Member = {
    brief:{
        id: string,
        isMember: boolean,
        deviceName: string
    }
    device?: TangoDevice
}

export declare type Family = {
    [member: string]: Member
}

export declare type Domain = {
    [family: string]: Family
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
    attributes?: Map<string, Attribute|null>
    commands?: Map<string, Command|null>
    pipes?: Map<string, Pipe|null>
    properties?: Map<string, Property|null>
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

export declare interface TangoStateNew {
    restApiUrl: string
    status: AuthStatus
    authHeader?: string
    servers: {[host: string]: {
            [port: number]: {

            }
        }
    }

}

export declare interface TangoState {
    host: string,
    status: AuthStatus,
    authHeader?: string
    servers: {
        [key: string]: {
            host: string,
            port: number,
            aliases?: {},
            domains: { [domain: string]: Domain }
        }
    }
}

export class TangoController extends ReduxStoreController<TangoState> {

    name: string;
    initialState = {
        host: getAbsHost("/"),
        status: AuthStatus.NOT_LOGGED,
        servers: {

        }
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
                        host: action.payload.host,
                        status: AuthStatus.API_MISMATCH,
                        servers: {

                        }
                    }
                    return state
                } else {
                    if (state.host === action.payload.host) {
                        if(state.status === AuthStatus.LOGGED) {
                            state = {...state, status: action.payload.status, authHeader: action.payload.authHeader}
                            return state
                        } else {
                            const { host, status, authHeader} = action.payload
                            state = {host, status, authHeader, servers: {}}
                            return state
                        }
                    } else {
                        const { host, status, authHeader} = action.payload
                        state = {host, status, authHeader, servers: {}}
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
                const key = `${host}:${port}`

                if(!state.servers.hasOwnProperty(key)) {
                    state.servers[key] = {host, port, domains: {}}
                }
            }
        }),
        loadStructure: this.createAsyncAction<{key: string}, TangoHost>({
            action: async (input, api) => {

                const state = (api.getState() as any)[this.name] as TangoState // TODO move to parent?
                const {host, port} = state.servers[input.key]

                const apiUrl = new URL(`hosts/${host}/${port}/`, genTangoURL(state.host)).href
                const devTreeUrl = new URL(`devices/tree`, apiUrl).href

                const resp = await (await fetch(apiUrl, {headers: {Authorization: state.authHeader}})).json()

                const devTree: DevTree = await (
                    await fetch(devTreeUrl, {headers: {Authorization: state.authHeader}})).json()

                return devTree[0]
            },
            fulfilled(state, action) {

                const tangoHost = action.payload

                const server = state.servers[action.meta.arg.key]

                server.aliases = (tangoHost.data[0] as Aliases)

                const domains = tangoHost.data.slice(1) as Array<TangoDomain>
                const domainsNames = domains.map(domain => domain.value)
                Object.keys(server.domains).forEach(key => {
                    if (!domainsNames.includes(key)) delete server.domains[key]})

                domains.forEach(extDomain => {
                    if(!server.domains.hasOwnProperty(extDomain.value)) {
                        server.domains[extDomain.value] = {}
                    }

                    const domain = server.domains[extDomain.value]

                    const families = extDomain.data
                    const familiesNames = families.map(family => family.value)

                    Object.keys(domain).forEach(key => {
                        if (!familiesNames.includes(key)) delete domain[key]
                    })

                    families.forEach(extFamily => {
                        if(!domain.hasOwnProperty(extFamily.value)) {
                            domain[extFamily.value] = {}
                        }

                        const family = domain[extFamily.value]
                        const members = extFamily.data
                        const membersNames = members.map(member => member.value)

                        Object.keys(family).forEach(key => {
                            if (!membersNames.includes(key)) delete family[key]
                        })

                        members.forEach(extMember => {
                            if(!family.hasOwnProperty(extMember.value)) {
                                family[extMember.value] = {
                                    brief: {
                                        id: extMember.id,
                                        isMember: extMember.isMember,
                                        deviceName: extMember.device_name
                                    }
                                }
                            } else {
                                const member = family[extMember.value]
                                member.brief.id = extMember.id
                                member.brief.isMember = extMember.isMember
                                member.brief.deviceName = extMember.device_name
                            }
                        })
                    })
                })
            },
            rejected(state, action) {
                console.log(action)
            }
        }),
        loadPath: this.createAsyncAction<{server: string, path: string}, {path: string, data: Object}>({
            action: async (input, api) => {

                const state = (api.getState() as any)[this.name] as TangoState // TODO move to parent?
                const {host, port} = state.servers[input.server]
                const apiUrl = new URL(`hosts/${host}/${port}/`, genTangoURL(state.host)).href

                const parts = input.path.split("/");





                // const devTreeUrl = new URL(`devices/tree`, apiUrl).href



                // const resp = await (await fetch(apiUrl, {headers: {Authorization: state.authHeader}})).json()

                // console.log(input.path)
                // const regex = /([^$]*)\/tango\/rest\/rc4\/hosts\/([^\/$]*)\/([0-9]*)([^$]*)/
                // const [ url, host, port, path ]= regex.exec(input.path).slice(1)
                //
                //
                // console.log(api.getState())
                // console.log(this.name)
                // console.log(api.getState()[this.name])
                //
                // const headers = new Headers({
                //     "Authorization": api.getState()[this.name].authHeader
                // })
                //
                // console.log(headers)
                //
                // if(!path || path === "/") {
                //     const resp = await fetch(`${url}/tango/rest/rc4/hosts/${host}/${port}/devices/tree`, {headers})
                //     console.log(resp)
                // }
                //
                // console.log(url, host, port, path)
            },
            fulfilled(state, action) {
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

