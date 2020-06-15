export enum CSS {
    TANGO_HOST = "tango_host",
    ALIASES = "aliases",
    TANGO_DOMAIN = "tango_domain",
    TANGO_FAMILY = "tango_family",
    MEMBER = "member",
}

export declare interface TreeItem {
    value: string,
    $css: CSS
}

export declare interface Aliases extends TreeItem {
    data: Array<any>
}

export declare interface ExtMember extends TreeItem {
    id: string,
    isMember: boolean
    device_name: string
}

export declare interface TangoFamily extends TreeItem {
    data: Array<ExtMember>
}

export declare interface TangoDomain extends TreeItem {
    data: Array<TangoFamily>
}

export declare interface TangoHost extends TreeItem {
    id: string,
    data: Array<Aliases | TangoDomain>
    isAlive: boolean
}

export declare type DevTree = Array<TangoHost>

export declare interface TangoDevice {
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
    attributes?: Array<DeviceAttribute>
    commands?: Array<DeviceCommand>
    pipes?: Array<DevicePipe>
    properties?: Array<DeviceProperty>
    state?: DeviceState
}

export declare interface DeviceCommand {
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


export declare interface DeviceAttribute {
    name: string,
    value?: AttributeValue,
    info?: AttributeInfo
    properties?: Array<DeviceProperty>
    history?: Array<AttributeValue>
}

export declare interface DevicePipe {
    name: string,
    size: number,
    timestamp: number,
    data: Array<{name: string, value: Array<string|number>}>
}

export declare interface DeviceProperty {
    name: string,
    values: Array<string>
}

export declare interface DeviceState {
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