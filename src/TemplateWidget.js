import React from "react";
import TemplateController from "./TemplateController";

import Webix from "./api/Webix";

export default function TemplateWidget() {
    const selector = TemplateController.selector
    const {setParam1, setParam2} = TemplateController.actions

    return (
        <Webix ui={{
            rows: [
                {
                    view: "datatable",
                    height: 150,
                    width: 500,
                    columns: [
                        {id: "property", header: "Property", width: 200},
                        {id: "value", header: "Value", width: 200},
                    ],
                    data: [
                        {id: 1, property: "param1", value: selector.param1},
                        {id: 2, property: "param2", value: selector.param2},
                    ]
                },
                {
                    cols: [{
                        view: "button",
                        id: "my_button",
                        value: "Change param1",
                        css: "webix_primary",
                        inputWidth: 250,
                        click: () => {setParam1(`${Math.random()}`)}},
                        {
                            view: "button",
                            id: "my_button2",
                            value: "Change param2",
                            css: "webix_primary",
                            inputWidth: 250,
                            click: () => {setParam2(`${Math.random()}`)}
                        }
                    ]
                }
            ]
        }}/>
    );
}
