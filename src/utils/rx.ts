import {AnyAction, Store} from "@reduxjs/toolkit";
import {Observable} from "rxjs";
import {distinctUntilChanged, map} from "rxjs/operators";
import _ from "lodash";
import {eqComp} from "../comparators";
import {GridWidgetStore} from "../GridWidget";

export function getState$(store: Store<GridWidgetStore, AnyAction>): Observable<GridWidgetStore> {
    return new Observable(function (observer) {
        observer.next(store.getState());
        return store.subscribe(function () {
            observer.next(store.getState());
        });
    });
}

export function getSelector$<T>(state$: Observable<GridWidgetStore>, select: (state: GridWidgetStore) => T): Observable<GridWidgetStore> {
    return state$.pipe<GridWidgetStore, GridWidgetStore>(
        map(select),
        distinctUntilChanged((x, y) => _.isEqualWith(x, y, eqComp))
    )
}


