import {configureStore} from '@reduxjs/toolkit';
import {Application} from "@waltz-controls/middleware";

export class ApplicationExt extends Application {

    #store;

    constructor({name, version}) {
        super({name, version});
        this.#store = null
    }

    get store() {return this.#store}

    /**
     * @param {Array<Controller>} controllers
     * @return {ApplicationExt}
     */
    setControllers(controllers) {
        const reducer = {}
        controllers.forEach(controller =>
            reducer[controller.name] = controller.reducer)

        this.#store = configureStore({reducer})
        return this
    }
}