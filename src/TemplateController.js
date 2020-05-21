import { PayloadAction } from '@reduxjs/toolkit';
import { Controller } from "./api/Controller";

                
/**            
 * @typedef {Object} TemplateState
 * @property {String} param1
 * @property {String} param2
 */

/**            
 * @typedef {Object} TemplateActions
 * @property {function(String)} setParam1
 * @property {function(String)} setParam2
 */

export class TemplateController extends Controller {
    /**
     * @param {TemplateState} initialState
     */
    constructor(initialState = {"param1":"param1","param2":"param2"}) {
        super({
            name: "Template",
            initialState,
            reducers: {
                
                /**
                * @param {TemplateState} state
                * @param {PayloadAction<String>} action
                */
                setParam2: (state, action) => {
                    state.param2 = action.payload
                },
        
                /**
                * @param {TemplateState} state
                * @param {PayloadAction<String>} action
                */
                setParam1: (state, action) => {
                    state.param1 = action.payload
                },
        
            },
        });
    }

    /**
     * @type {TemplateActions}
     */
    get actions() {
        return super.actions
    }

    /**
     * @type {TemplateState}
     */
    get selector() {
        return super.selector
    }
}

export default new TemplateController()
