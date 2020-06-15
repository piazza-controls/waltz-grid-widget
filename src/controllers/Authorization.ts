import {ReduxStoreController, registerController} from "waltz-base";
import {genTangoURL, getAbsHost, isAbsoluteURL} from "../utils";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

export enum ApiType {
    TANGO = "TANGO"
}

export enum AuthStatus {
    LOGGED = "LOGGED",
    NOT_LOGGED = "NOT_LOGGED",
    API_MISMATCH = "API_MISMATCH",
    ERROR = "ERROR",
}

export declare type HostStatus = {
    status: AuthStatus
    header?: string
    error?: string
}


export declare type AuthState = {
    api: ApiType,
    host: string,
    status: AuthStatus
    authHeader?: string
    error?: string
}

export class Authorization extends ReduxStoreController<AuthState> {

    name: string;

    initialState: AuthState = JSON.parse(localStorage.getItem(this.name)) as AuthState || {
        api: ApiType.TANGO,
        host: "/",
        status: AuthStatus.NOT_LOGGED,
        authHeader: null
    };

    mappers = {}
    selectors = {}

    actions = {
        authorize: this.createAsyncAction<{
            api: ApiType, host: string,
            user: string, password: string,
            remember: boolean
        }, string>({

            action: async (input, _) => {

                const {api, host, user, password} = input

                switch (api) {
                    case ApiType.TANGO:
                        {
                            const url = genTangoURL(host)

                            const resp =  await fetch(url,{
                                headers: new Headers({
                                    "Authorization": `Basic ${btoa(`${user}:${password}`)}`
                                }),
                            })

                            switch (resp.status) {
                                case 200:
                                    return `Basic ${btoa(`${user}:${password}`)}`
                                case 401:
                                    throw new Error("Incorrect username/password")
                                default:
                                    throw new Error(`Server error ${resp.status}`)
                            }

                        }
                    default:
                        throw new Error(`unhandled api type: ${api}`)
                }
            },
            fulfilled: (state, action) => {

                state.host = getAbsHost(action.meta.arg.host)
                state.api = action.meta.arg.api
                state.status = AuthStatus.LOGGED
                state.error = null
                state.authHeader = action.payload

                if(action.meta.arg.remember) {
                    localStorage.setItem(this.name, JSON.stringify(state))
                }
            },
            rejected: (state, action) => {

                state.host = getAbsHost(action.meta.arg.host)
                state.api = action.meta.arg.api
                state.status = AuthStatus.ERROR
                state.error = action.error.message
                state.authHeader = null

                if(action.meta.arg.remember) {
                    localStorage.setItem(this.name, JSON.stringify(state))
                }
            },
            // TODO: pending?
        }),
    };
}

const controller = new Authorization()
registerController(controller)
export default controller

