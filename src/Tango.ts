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
    value: AttributeValue
    info: AttributeInfo
    properties?: {[key: string]: Property} // TODO need null?
    history: Array<AttributeValue>
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
    attributes: { [name:string]: Attribute|null }
    commands: { [name:string]: Command|null }
    pipes: { [name:string]: Pipe|null }
    properties: { [name:string]: Property|null }
    state: State
}






