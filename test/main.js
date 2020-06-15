import React from 'react'

import {ApplicationExt, ReactLayout} from 'waltz-base'
import App from "./App";

const elem = document.createElement('div');
elem.setAttribute("id", "root");
document.body.append(elem)

new ApplicationExt({name: "APPNAME", version: "VERSION"})
    .registerWidget((app) => new ReactLayout("root", () => (
        <App/>
    ), app))
    .run()



