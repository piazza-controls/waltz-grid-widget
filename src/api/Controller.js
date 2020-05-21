import { createSlice } from '@reduxjs/toolkit';
import {useDispatch, useSelector} from "react-redux";

/**
 * @template T
 */
export class Controller {
    #name;

    constructor(options) {
        this.#name = options.name
        this.slice = createSlice(options);
    }

    get name() {return this.#name}
    get reducer() {return this.slice.reducer}
    get actions() {
        const dispatch = useDispatch();
        const dispatched = {}
        Object.entries(this.slice.actions).forEach(entry => {
            const [key, value] = entry
            dispatched[key] = (...args) => dispatch(value(...args))
        })
        return dispatched
    }
    get selector() {
        return useSelector(state => state[this.#name])
    }
}