import React from 'react'
import {ApplicationExt} from "../src/api/ApplicationExt";
import {TangoRestController} from "@waltz-controls/waltz-tango-rest-plugin"
import ReactLayout from "../src/api/ReactLayout";
import TemplateController from "../src/TemplateController";
import TemplateWidget from "../src/TemplateWidget";


new ApplicationExt({name: "APPNAME", version: "VERSION"})
    .setControllers([TemplateController])
    .registerController((app) => new TangoRestController(app))
    .registerWidget((app) => new ReactLayout("root", () => (
        <TemplateWidget>
        </TemplateWidget>
    ), app))
    .run()



