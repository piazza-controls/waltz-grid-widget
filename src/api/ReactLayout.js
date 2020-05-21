import {WaltzWidget} from "@waltz-controls/middleware";
import React, {ReactNode} from "react"
import ReactDOM from "react-dom"
import { Provider } from 'react-redux';
import {ApplicationExt} from "./ApplicationExt";

export default class ReactLayout extends WaltzWidget {
    #rootId;
    #App;

    /**
     * @param {String} rootId
     * @param {ReactNode} App
     * @param {ApplicationExt} app
     */
    constructor(rootId, App, app=null) {
        super("reactLayout", app);
        this.#rootId = rootId
        this.#App = App
    }

    run() {
        const App = this.#App
        const wrapper = document.getElementById(this.#rootId);
        wrapper ? ReactDOM.render(<React.StrictMode>
                <Provider store={this.app.store}>
                    <App/>
                </Provider>
            </React.StrictMode>, wrapper) : false;
    }
}