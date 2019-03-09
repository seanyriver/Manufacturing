import { AppThunkAction } from "../store";
import { CollectionResults } from "../store/CollectionResults";
import { Fetch } from "../middleware/Fetch";
import { addTask } from "domain-task";
import { Action } from "redux";
import { Patch, PostJson, DeleteJson, PatchJson } from "../store/Tools";
import UniqueEntity from "../store/UniqueEntity";

/**
 *  Describes a state which contents a dictionary of items, indexed by ID,
 *  a list of items, drafts, and states of items being created or patched.
 *  
 *  Application state entities can derive from this and components can use
 *  this as a base type e.g.
 *  
 *  class TestComponent extends React.Component<CollectionState<MyType>,{}>
 */
export interface CollectionState<T extends UniqueEntity> {
    items: { [id: string]: T };
    list: string[];
    start: number;
    count: number;
    totalCount: number;
    search: string;
    loading: boolean;

    // Draft items currently being edited.
    drafts: { [id: string]: T };

    // If a draft ID is in 'creating', it is being created
    creating: { [id: string]: boolean };

    // If an item ID is in 'patching', it is being patched
    patching: { [id: string]: boolean }

    // Errors associated with a particular draft or item ID.
    errors: { [id: string]: string[] };
}

export interface RequestItemAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    id: string;
}

export interface ReceiveItemAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    id: string;
    item: T;
}

export interface RequestItemsAction<T extends UniqueEntity,TYPE> {
    type: TYPE;
    search: string;
    start: number;
    count: number;
}

export interface ReceiveItemsAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    items: T[];
    search: string;
    start: number;
    count: number;
    totalCount: number;
}


export interface RequestCreateDraftAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    item: T;
    draftId: string;
}

export interface RequestPatchDraftAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    item: Partial<T>;
    draftId: string;
}

export interface RequestClearDraftAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    draftId: string;
}

export interface LogErrorAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    id: string;
    errors: string[];
}

export interface RequestCreateItemAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    item: T;
    draftId?: string;
}

export interface ReceiveCreateItemAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    item: T;
    draftId?: string;
}

export interface RequestArchiveItemAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    id: string;
}

export interface ReceiveArchiveItemAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    id: string;
}

export interface RequestPatchItemAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    id: string;
    item: Partial<T>;
}

export interface ReceivePatchItemAction<T extends UniqueEntity, TYPE> {
    type: TYPE;
    id: string;
    item: Partial<T>;
}

export type CollectionConfig<T extends UniqueEntity, A,
    REQUESTITEMTYPE, RECEIVEITEMTYPE,
    REQUESTITEMSTYPE, RECEIVEITEMSTYPE,
    REQUESTCREATEDRAFTTYPE, REQUESTPATCHDRAFTTYPE, REQUESTCLEARDRAFTTYPE,
    LOGERRORTYPE,
    REQUESTCREATEITEMTYPE, RECEIVECREATEITEMTYPE,
    REQUESTPATCHITEMTYPE, RECEIVEPATCHITEMTYPE,
    REQUESTARCHIVEITEMTYPE, RECEIVEARCHIVEITEMTYPE> =
    {
        reqItem: REQUESTITEMTYPE,
        rcvItem: RECEIVEITEMTYPE,
        reqItems: REQUESTITEMSTYPE,
        rcvItems: RECEIVEITEMSTYPE,
        reqCreateItem: REQUESTCREATEITEMTYPE,
        rcvCreateItem: RECEIVECREATEITEMTYPE,
        reqPatchItem: REQUESTPATCHITEMTYPE,
        rcvPatchItem: RECEIVEPATCHITEMTYPE,
        reqArchiveItem: REQUESTARCHIVEITEMTYPE,
        rcvArchiveItem: RECEIVEARCHIVEITEMTYPE,
        reqCreateDraft: REQUESTCREATEDRAFTTYPE,
        reqPatchDraft: REQUESTPATCHDRAFTTYPE,
        reqClearDraft: REQUESTCLEARDRAFTTYPE,
        logError: LOGERRORTYPE,
        prepareItem: (item: T) => T,
        actionCreators: A,
    };

export type KnownCollectionAction<T,
    REQUESTITEMTYPE, RECEIVEITEMTYPE,
    REQUESTITEMSTYPE, RECEIVEITEMSTYPE,
    REQUESTCREATEDRAFTTYPE, REQUESTPATCHDRAFTTYPE, REQUESTCLEARDRAFTTYPE,
    LOGERRORTYPE,
    REQUESTCREATEITEMTYPE, RECEIVECREATEITEMTYPE,
    REQUESTPATCHITEMTYPE, RECEIVEPATCHITEMTYPE,
    REQUESTARCHIVEITEMTYPE, RECEIVEARCHIVEITEMTYPE>
    = RequestItemAction<T, REQUESTITEMTYPE> | ReceiveItemAction<T, RECEIVEITEMTYPE>
    | RequestItemsAction<T, REQUESTITEMSTYPE> | ReceiveItemsAction<T, RECEIVEITEMSTYPE>
    | RequestCreateDraftAction<T, REQUESTCREATEDRAFTTYPE> | RequestPatchDraftAction<T, REQUESTPATCHDRAFTTYPE> | RequestClearDraftAction<T, REQUESTCLEARDRAFTTYPE>
    | LogErrorAction<T, LOGERRORTYPE>
    | RequestCreateItemAction<T, REQUESTCREATEITEMTYPE> | ReceiveCreateItemAction<T, RECEIVECREATEITEMTYPE>
    | RequestPatchItemAction<T, REQUESTPATCHITEMTYPE> | ReceivePatchItemAction<T, RECEIVEPATCHITEMTYPE>
    | RequestArchiveItemAction<T, REQUESTARCHIVEITEMTYPE> | ReceiveArchiveItemAction<T, RECEIVEARCHIVEITEMTYPE>
    ;

export type abstractActionCreators<T> = {
    requestItem: (id: string) => any;
    requestItems: (search: string, start: number, count: number, includeArchived: boolean) => any;
    requestCreateDraft: (item: T, draftId: string) => any;
    requestPatchDraft: (item: Partial<T>, draftId: string) => any;
    requestClearDraft: (draftId: string) => any;
    requestCreateItem: (item: T, draftId?: string) => any;
    requestPatchItem: (id: string, item: Partial<T>, draftId?: string) => any;
    requestArchiveItem: (id: string) => any;
    requestRestoreItem: (id: string) => any;
}

export function CreateCollectionActionCreators<T extends UniqueEntity, A,
    REQUESTITEMTYPE, RECEIVEITEMTYPE,
    REQUESTITEMSTYPE, RECEIVEITEMSTYPE,
    REQUESTCREATEDRAFTTYPE, REQUESTPATCHDRAFTTYPE, REQUESTCLEARDRAFTTYPE,
    LOGERRORTYPE,
    REQUESTCREATEITEMTYPE, RECEIVECREATEITEMTYPE,
    REQUESTPATCHITEMTYPE, RECEIVEPATCHITEMTYPE,
    REQUESTARCHIVEITEMTYPE, RECEIVEARCHIVEITEMTYPE>
    (name: string,
    config: CollectionConfig<T, A,
        REQUESTITEMTYPE, RECEIVEITEMTYPE,
        REQUESTITEMSTYPE, RECEIVEITEMSTYPE,
        REQUESTCREATEDRAFTTYPE, REQUESTPATCHDRAFTTYPE, REQUESTCLEARDRAFTTYPE,
        LOGERRORTYPE,
        REQUESTCREATEITEMTYPE, RECEIVECREATEITEMTYPE,
        REQUESTPATCHITEMTYPE, RECEIVEPATCHITEMTYPE,
        REQUESTARCHIVEITEMTYPE, RECEIVEARCHIVEITEMTYPE>,
): abstractActionCreators<T> & typeof config.actionCreators {

    type ThunkAction = AppThunkAction<KnownCollectionAction<T,
        REQUESTITEMTYPE, RECEIVEITEMTYPE,
        REQUESTITEMSTYPE, RECEIVEITEMSTYPE,
        REQUESTCREATEDRAFTTYPE, REQUESTPATCHDRAFTTYPE, REQUESTCLEARDRAFTTYPE,
        LOGERRORTYPE,
        REQUESTCREATEITEMTYPE, RECEIVECREATEITEMTYPE,
        REQUESTPATCHITEMTYPE, RECEIVEPATCHITEMTYPE,
        REQUESTARCHIVEITEMTYPE, RECEIVEARCHIVEITEMTYPE>>;

    return Object.assign({}, config.actionCreators, {
        requestItem: (id: string): ThunkAction => (dispatch, getState) => {
            let fetchTask = Fetch(`api/${name}/${id}`)
                .then(response => response.json() as Promise<T>)
                .then(item =>
                    dispatch({ type: config.rcvItem, id, item })
                );

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: config.reqItem, id });
        },

        requestItems: (search: string, start: number, count: number, includeArchived: boolean): ThunkAction => (dispatch, getState) => {
            let fetchTask = Fetch(`api/${name}?search=` + encodeURIComponent(search) + "&start=" + start + "&count=" + count
            + (includeArchived ? "&includeArchived=true" : ""))
                .then(response => response.json() as Promise<CollectionResults<T>>)
                .then(data =>
                    dispatch({ type: config.rcvItems, items: data.items, search: search, start: start, count: count, totalCount: data.totalCount })
                );

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: config.reqItems, search: search, start: start, count: count });
        },

        requestCreateItem: (item: T, draftId?: string): ThunkAction => (dispatch, getState) => {
            let fetchTask = Fetch(`api/${name}`, PostJson(item))
                .then(response => response.json() as Promise<T>)
                .then(item =>
                    dispatch({ type: config.rcvCreateItem, item, draftId })
                );

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: config.reqCreateItem, item, draftId });
        },

        requestPatchItem: (id: string, item: Partial<T>, draftId?: string): ThunkAction => (dispatch, getState) => {
            let fetchTask = Fetch(`api/${name}/${id}`, PatchJson(item))
                .then(response => response.json() as Promise<T>)
                .then(item =>
                    dispatch({ type: config.rcvPatchItem, id, item, draftId })
                );

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: config.reqPatchItem, id, item, draftId });
        },

        requestArchiveItem: (id: string): ThunkAction => (dispatch, getState) => {
            let fetchTask = Fetch(`api/${name}/${id}`, DeleteJson())
                .then(response => response.json() as Promise<boolean>)
                .then(success => {
                    if (success)
                        dispatch({ type: config.rcvArchiveItem, id })
                });

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: config.reqArchiveItem, id });
        },

        requestRestoreItem: (id: string): ThunkAction => (dispatch, getState) => {
            var item: Partial<T> = {};
            item.archived = false;

            let fetchTask = Fetch(`api/${name}/${id}/archived`, DeleteJson())
                .then(response => response.json() as Promise<T>)
                .then(item =>
                    dispatch({ type: config.rcvPatchItem, id, item })
                );

            addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
            dispatch({ type: config.reqPatchItem, id, item });
        },

        requestCreateDraft: (item: T, draftId: string): ThunkAction => (dispatch, getState) => {
            dispatch({ type: config.reqCreateDraft, item, draftId });
        },

        requestPatchDraft: (item: Partial<T>, draftId: string): ThunkAction => (dispatch, getState) => {
            dispatch({ type: config.reqPatchDraft, item, draftId });
        },

        requestClearDraft: (draftId: string): ThunkAction => (dispatch, getState) => {
            dispatch({ type: config.reqClearDraft, draftId });
        },
    });
}

export function CreateUnloadedCollectionState<T>(additions: any) : CollectionState<T> & typeof additions {
    return Object.assign({}, {
        items: {},
        list: [],
        loading: false,
        search: "",
        start: 0,
        count: -1,
        totalCount: 0,
        drafts: {},
        errors: [],
    }, additions);
}

function PrepareItems<T extends UniqueEntity>(items: T[], prepareItem: (item: T) => T) {
    return !items ? items : items.map(f => prepareItem(f));
}

export function CollectionReducer<T extends UniqueEntity, A,
    REQUESTITEMTYPE, RECEIVEITEMTYPE,
    REQUESTITEMSTYPE, RECEIVEITEMSTYPE,
    REQUESTCREATEDRAFTTYPE, REQUESTPATCHDRAFTTYPE, REQUESTCLEARDRAFTTYPE,
    LOGERRORTYPE,
    REQUESTCREATEITEMTYPE, RECEIVECREATEITEMTYPE,
    REQUESTPATCHITEMTYPE, RECEIVEPATCHITEMTYPE,
    REQUESTARCHIVEITEMTYPE, RECEIVEARCHIVEITEMTYPE>
    (
    config: CollectionConfig<T, A,
        REQUESTITEMTYPE, RECEIVEITEMTYPE,
        REQUESTITEMSTYPE, RECEIVEITEMSTYPE,
        REQUESTCREATEDRAFTTYPE, REQUESTPATCHDRAFTTYPE, REQUESTCLEARDRAFTTYPE,
        LOGERRORTYPE,
        REQUESTCREATEITEMTYPE, RECEIVECREATEITEMTYPE,
        REQUESTPATCHITEMTYPE, RECEIVEPATCHITEMTYPE,
        REQUESTARCHIVEITEMTYPE, RECEIVEARCHIVEITEMTYPE>,
    state: CollectionState<T>, incomingAction: Action) {

    const action = incomingAction as KnownCollectionAction<T,
        REQUESTITEMTYPE, RECEIVEITEMTYPE,
        REQUESTITEMSTYPE, RECEIVEITEMSTYPE,
        REQUESTCREATEDRAFTTYPE, REQUESTPATCHDRAFTTYPE, REQUESTCLEARDRAFTTYPE,
        LOGERRORTYPE,
        REQUESTCREATEITEMTYPE, RECEIVECREATEITEMTYPE,
        REQUESTPATCHITEMTYPE, RECEIVEPATCHITEMTYPE,
        REQUESTARCHIVEITEMTYPE, RECEIVEARCHIVEITEMTYPE>;

    if (action.type == config.reqItem) {
        var reqItemAction = action as RequestItemAction<T, REQUESTITEMTYPE>;

        return state;
    }
    else if (action.type == config.rcvItem) {
        var rcvItemAction = action as ReceiveItemAction<T, RECEIVEITEMTYPE>;

        var items = Patch(state.items, { [rcvItemAction.id]: rcvItemAction.item });
        return Patch(state, { items });
    }
    if (action.type == config.reqItems) {
        var reqItemsAction = action as RequestItemsAction<T, REQUESTITEMSTYPE>;

        return Patch(state, { loading: true, search: reqItemsAction.search });
    }
    else if (action.type == config.rcvItems) {
        var rcvItemsAction = action as ReceiveItemsAction<T, RECEIVEITEMSTYPE>;

        if ((rcvItemsAction.search || "") != (state.search || ""))
            return null;

        var items = Object.assign({}, state.items);
        var list = PrepareItems(rcvItemsAction.items, config.prepareItem).map((item: T) => {
            if (item.id)
                items[item.id] = item;
            return item.id || "";
        });

        return Patch(state, {
            items,
            list:
                rcvItemsAction.start == 0 ?
                    list :
                    state.list.concat(list),
            search: rcvItemsAction.search,
            count: rcvItemsAction.count,
            start: rcvItemsAction.start,
            loading: false,
            totalCount: rcvItemsAction.totalCount,
        });
    }
    else if (action.type == config.reqCreateDraft) {
        var reqDraftAction = action as RequestCreateDraftAction<T, REQUESTCREATEDRAFTTYPE>;
        var drafts = Patch(state.drafts, { [reqDraftAction.draftId]: reqDraftAction.item });
        var errors = Patch(state.errors, { [reqDraftAction.draftId]: [] });
        return Patch(state, { drafts, errors });
    }
    else if (action.type == config.reqPatchDraft) {
        var reqPatchDraftAction = action as RequestPatchDraftAction<T, REQUESTPATCHDRAFTTYPE>;
        var draftPatch = Patch(state.drafts[reqPatchDraftAction.draftId], reqPatchDraftAction.item);
        var drafts = Patch(state.drafts, { [reqPatchDraftAction.draftId]: draftPatch });
        var errors = Patch(state.errors, { [reqPatchDraftAction.draftId]: [] });
        return Patch(state, { drafts, errors });
    }
    else if (action.type == config.reqClearDraft) {
        var clearDraftAction = action as RequestClearDraftAction<T, REQUESTCLEARDRAFTTYPE>;
        var drafts = Patch(state.drafts, {});
        delete drafts[clearDraftAction.draftId];
        var errors = Patch(state.errors, {});
        delete errors[clearDraftAction.draftId];
        return Patch(state, { drafts, errors });
    }
    else if (action.type == config.logError) {
        var logErrorAction = action as LogErrorAction<T, LOGERRORTYPE>;
        var errors = Patch(state.errors, {});
        errors[logErrorAction.id] = logErrorAction.errors;
        return Patch(state, { errors });
    }
    else if (action.type == config.reqCreateItem) {
        var reqCreateAction = action as RequestCreateItemAction<T, REQUESTCREATEITEMTYPE>;
        var { draftId } = reqCreateAction;
        if (!draftId)
            return state;

        var creating = Patch(state.creating, { [draftId]: true });
        return Patch(state, { creating });
    }
    else if (action.type == config.rcvCreateItem) {
        var createAction = action as ReceiveCreateItemAction<T, RECEIVECREATEITEMTYPE>;
        var { item, draftId } = createAction;

        if (!item.id)
            return null;

        var items = Patch(state.items, { [item.id]: item });
        var drafts = state.drafts;
        var creating = state.creating;

        // We also update the draft.  This allows someone observing the draft to see that it
        // has an id (and thus has been created).
        if (draftId) {
            drafts = Patch(drafts, { [draftId]: createAction.item });
            patching = Patch(creating, {});
            delete creating[draftId];
        }

        return Patch(state, { items, drafts, creating });
    }
    else if (action.type == config.reqPatchItem) {
        var reqCreateAction = action as RequestCreateItemAction<T, REQUESTCREATEITEMTYPE>;
        var { draftId } = reqCreateAction;
        if (!draftId)
            return state;

        var patching = Patch(state.patching, { [draftId]: true });
        return Patch(state, { patching });
    }
    else if (action.type == config.rcvPatchItem) {
        var createAction = action as ReceiveCreateItemAction<T, RECEIVECREATEITEMTYPE>;
        var { item, draftId } = createAction;

        if (!item.id)
            return null;

        var items = Patch(state.items, { [item.id]: item });
        var drafts = state.drafts;
        var patching = state.patching;

        // We also update the draft.  This allows someone observing the draft to see
        // the newly saved item.
        if (draftId) {
            drafts = Patch(drafts, { [draftId]: createAction.item });
            patching = Patch(patching, {});
            delete patching[draftId];
        }

        return Patch(state, { items, drafts, patching });
    }
    else if (action.type == config.reqArchiveItem) {

    }
    else if (action.type == config.rcvArchiveItem) {
        // Update the item's archived flag.
        var rcvArchiveAction = action as ReceiveArchiveItemAction<T, RECEIVEARCHIVEITEMTYPE>;
        var { id } = rcvArchiveAction;  

        var item = state.items[id];
        if (!item)
            return state;

        item = Patch(item, { });
        item.archived = true;
        var items = Patch(state.items, { [id]: item });
        return Patch(state, { items });
    }

    return null;
}