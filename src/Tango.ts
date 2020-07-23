export declare interface Device {
    host: string,
    device: string,
    attributes?: Array<{name: string, value: string|number}>
    commands?: Array<{name: string}>
}