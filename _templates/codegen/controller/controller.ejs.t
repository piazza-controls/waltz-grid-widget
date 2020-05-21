---
to: src/<%= h.getName(spec)%>Controller.js
---
import { PayloadAction } from '@reduxjs/toolkit';
import { Controller } from "./api/Controller";
<%= h.genStateDoc(spec) %>
<%= h.getActions(spec) %>

export class <%= h.getName(spec)%>Controller extends Controller {
    /**
     * @param {<%= h.getName(spec)%>State} initialState
     */
    constructor(initialState = <%-h.getInitialValue(spec)%>) {
        super({
            name: "<%= h.getName(spec)%>",
            initialState,
            reducers: {
                <%-h.getReducers(spec) %>
            },
        });
    }

    /**
     * @type {<%= h.getName(spec)%>Actions}
     */
    get actions() {
        return super.actions
    }

    /**
     * @type {<%= h.getName(spec)%>State}
     */
    get selector() {
        return super.selector
    }
}

export default new <%= h.getName(spec)%>Controller()
