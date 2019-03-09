import UniqueEntity from './UniqueEntity';
import { CollectionResults } from './CollectionResults';
import { AppThunkAction } from '../store';
import { Fetch } from '../middleware/Fetch';
import { addTask } from 'domain-task';
import { Reducer } from 'redux';
import { Action } from 'redux';
import { Patch } from './Tools';

export interface Address extends UniqueEntity {
    postcode?: string;
    city?: string;
    country?: string;
    locality?: string;
    line3?: string;
    property?: string;
    street?: string;
}

export interface AddressState {
    items?: { [id: string]: Address[] };
    search?: string;
    drafts?: { [id: string]: Address };
}

interface RequestSearchAddressesAction {
    type: 'REQUEST_SEARCHADDRESSES';
    id: string;
    search: string;
    start: number;
    count: number;
}

interface ReceiveSearchAddressesAction {
    type: 'RECEIVE_SEARCHADDRESSES';
    id: string;
    search: string;
    start: number;
    count: number;
    results: CollectionResults<Address>;
}

interface RequestClearAddressSearchAction {
    type: 'REQUEST_CLEARADDRESSSEARCH';
    id: string;
}

interface RequestSetDraftAction {
    type: 'REQUEST_SETDRAFT';
    address: Address;
    draftId: string;
}
interface RequestPatchDraftAction {
    type: 'REQUEST_PATCHDRAFT';
    address: Address;
    draftId: string;
}

type KnownAction = RequestSearchAddressesAction
    | ReceiveSearchAddressesAction
    | RequestClearAddressSearchAction
    | RequestSetDraftAction
    | RequestPatchDraftAction
    ;

var NextDraftId: number = 1;

export const getDraftAddressId = () => `${NextDraftId++}`;

const AddressRegex = /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;


export const actionCreators = {
    requestSearchAddresses: (id: string, search: string, start: number = 0, count: number = -1): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (!AddressRegex.test(search))
            return;

        let fetchTask = Fetch(`api/addresses?search=` + encodeURIComponent(search) + "&start=" + start + "&count=" + count)
            .then(response => response.json() as Promise<CollectionResults<Address>>)
            .then(results =>
                dispatch({ type: 'RECEIVE_SEARCHADDRESSES', id, search, start, count, results })
            );

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_SEARCHADDRESSES', id, search, start, count, });
    },

    requestClearAddressSearch: (id: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'REQUEST_CLEARADDRESSSEARCH', id });
    },

    requestSetDraft: (draftId: string, address: Address): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'REQUEST_SETDRAFT', draftId, address });
    },

    requestPatchDraft: (draftId: string, address: Address): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'REQUEST_PATCHDRAFT', draftId, address });
    },
};

const unloadedState: AddressState = {
    items: {},
    search: "",
    drafts: {},
};

export const reducer: Reducer<AddressState> = (state: AddressState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_SEARCHADDRESSES':
            break;

        case 'RECEIVE_SEARCHADDRESSES':
            if (!state.items)
                break;

            var newItems = Patch(state.items, {[action.id] : action.results.items });
            return Patch(state, {
                search: action.search,
                items: newItems,
            } as AddressState);

        case 'REQUEST_CLEARADDRESSSEARCH':
            if (!state.items)
                break;

            var newItems = Object.assign({}, state.items);
            delete newItems[action.id];

            return Patch(state, {
                search: "",
                items: newItems,
            } as AddressState);

        case 'REQUEST_SETDRAFT':
            if (!state.drafts)
                break;

            var drafts = Patch(state.drafts, { [action.draftId] : action.address });
            return Patch(state, { drafts });

        case 'REQUEST_PATCHDRAFT':
            if (!state.drafts)
                break;

            var draft = state.drafts[action.draftId];
            if (!draft)
                break;

            var drafts = Patch(state.drafts, { [action.draftId]: Patch(draft, action.address) });
            return Patch(state, { drafts });

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};