import UniqueEntity, { PrepareUniqueEntity } from "./UniqueEntity";
import NamedEntity from "./NamedEntity";
import { AppThunkAction } from "../store";
import { CollectionResults } from "../store/CollectionResults";
import { Fetch } from "../middleware/Fetch";
import { addTask } from "domain-task";
import { Reducer } from "redux";
import { Action } from "redux";
import { Patch, PostJson, ClientId, AddOrUpdate, LogChange, LogRemoval } from "./Tools";
import { CollectionState, KnownCollectionAction, CollectionConfig, CreateCollectionActionCreators, CollectionReducer, CreateUnloadedCollectionState } from "../store/CollectionState";

export default interface Material extends NamedEntity {
    units: string;
    //tags: string[];
}

export interface MaterialState extends CollectionState<Material> {
}

export function PrepareMaterial(item: Material): Material {
    return PrepareUniqueEntity(item);
}

export function CloneMaterial(item: Material): Material {
    return PrepareMaterial(JSON.parse(JSON.stringify(item)));
}

// Convention to assign enumeration values to each action type.
const Config = {
    reqItem: 'REQUEST_MATERIAL' as 'REQUEST_MATERIAL',
    rcvItem: 'RECEIVE_MATERIAL' as 'RECEIVE_MATERIAL',
    reqItems: 'REQUEST_MATERIALS' as 'REQUEST_MATERIALS',
    rcvItems: 'RECEIVE_MATERIALS' as 'RECEIVE_MATERIALS',
    reqCreateDraft: 'REQUEST_CREATE_DRAFT_MATERIAL' as 'REQUEST_CREATE_DRAFT_MATERIAL',
    reqPatchDraft: 'REQUEST_PATCH_DRAFT_MATERIAL' as 'REQUEST_PATCH_DRAFT_MATERIAL',
    reqClearDraft: 'REQUEST_CLEAR_DRAFT_MATERIAL' as 'REQUEST_CLEAR_DRAFT_MATERIAL',
    logError: 'ERROR_MATERIAL' as 'ERROR_MATERIAL',
    reqCreateItem: 'REQUEST_CREATE_MATERIAL' as 'REQUEST_CREATE_MATERIAL',
    rcvCreateItem: 'RECEIVE_CREATE_MATERIAL' as 'RECEIVE_CREATE_MATERIAL',
    reqPatchItem: 'REQUEST_PATCH_MATERIAL' as 'REQUEST_PATCH_MATERIAL',
    rcvPatchItem: 'RECEIVE_PATCH_MATERIAL' as 'RECEIVE_PATCH_MATERIAL',
    reqArchiveItem: 'REQUEST_ARCHIVE_MATERIAL' as 'REQUEST_ARCHIVE_MATERIAL',
    rcvArchiveItem: 'RECEIVE_ARCHIVE_MATERIAL' as 'RECEIVE_ARCHIVE_MATERIAL',
    prepareItem: PrepareMaterial,
    actionCreators: {
    },
};

// Convention to declare known actions.
type KnownAction = KnownCollectionAction<Material,
    typeof Config.reqItem, typeof Config.rcvItem,
    typeof Config.reqItems, typeof Config.rcvItems,
    typeof Config.reqCreateDraft, typeof Config.reqPatchDraft, typeof Config.reqClearDraft,
    typeof Config.logError,
    typeof Config.reqCreateItem, typeof Config.rcvCreateItem,
    typeof Config.reqPatchItem, typeof Config.rcvPatchItem,
    typeof Config.reqArchiveItem, typeof Config.rcvArchiveItem
    >;

export const actionCreators = CreateCollectionActionCreators("materials", Config);

const unloadedState: MaterialState = CreateUnloadedCollectionState<Material>({});

export const reducer: Reducer<MaterialState> = (state: MaterialState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;

    switch (action.type) {
            
        // We need to explicitly state which items will be processed by the reducer here.
        // This ensures that custom actions and new collection actions are not missed.
        case Config.reqItem:
        case Config.rcvItem:
        case Config.reqItems:
        case Config.rcvItems:
        case Config.reqCreateDraft:
        case Config.reqPatchDraft:
        case Config.reqClearDraft:
        case Config.logError:
        case Config.reqCreateItem:
        case Config.rcvCreateItem:
        case Config.reqPatchItem:
        case Config.rcvPatchItem:
        case Config.reqArchiveItem:
        case Config.rcvArchiveItem:
            var result = CollectionReducer(Config, state, incomingAction);
            if (result)
                return result;

            break;

        // Custom actions go here.

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};