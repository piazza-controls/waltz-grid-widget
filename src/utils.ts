const regexIsAbsURL = new RegExp('^(?:[a-z]+:)?//', 'i');

export function isAbsoluteURL(url: string): boolean {
    return regexIsAbsURL.test(url)
}

export function getAbsHost(host: string) {
    return isAbsoluteURL(host)? host :
        new URL(host,`${window.location.protocol}//${window.location.host}`).href
}

export function genTangoURL(host: string): string {
    return isAbsoluteURL(host)?
        new URL("tango/rest/rc4/", host).href :
        new URL("tango/rest/rc4/",
            new URL(host,`${window.location.protocol}//${window.location.host}`)).href
}