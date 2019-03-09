import { addTask } from 'domain-task';
import { Fetch } from '../middleware/Fetch';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import { CollectionResults } from './CollectionResults';
import { PostJson, PatchJson, URLArgs, ClientId, DeleteJson, PutJson, Patch } from './Tools';
import { CreateUserResponse } from '../store/CreateUserResponse';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface User {
    userName?: string;
    firstName?: string;
    lastName?: string;
    id?: string;
    roles?: string[];
    confirmed?: boolean;
}

export function GetUserLabel(user: User) {
    var { firstName, lastName, userName } = user;
    return !firstName && !lastName ?  userName :
        firstName + (firstName && lastName ? " " : "") + lastName;
}

export interface UserState {
    // Lists against each scheme.
    list?: string[];

    // Quick lookup of all items.
    items?: { [id: string]: User }

    // The parameters of the current state.
    search?: string;
    start?: number;
    count?: number;
    totalCount?: number;

    userToCreate?: User;
    creationErrors?: string[];
    creationSucceeded?: boolean;
    creatingUser?: boolean;

    passwordChangeErrors?: { [id: string]: string[] };
    passwordChangeActivities?: { [id: string]: boolean };

}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestUsersAction {
    type: 'REQUEST_USERS';
    search?: string;
    start?: number;
    count?: number;
}

interface ReceiveUsersAction {
    type: 'RECEIVE_USERS';
    search?: string;
    start?: number;
    count?: number;
    results?: CollectionResults<User>;
}

interface RequestUserAction {
    type: 'REQUEST_USER';
    id: string;
}

interface ReceiveUserAction {
    type: 'RECEIVE_USER';
    user: User;
}

interface RequestCreateUserAction {
    type: 'REQUEST_CREATEUSER';
    user: User;
    sendNotificationEmail: boolean;
}

interface ReceiveCreateUserAction {
    type: 'RECEIVE_CREATEUSER';
    response: CreateUserResponse;
}

interface RequestStartCreateUserAction {
    type: 'RECEIVE_STARTCREATEUSER';
    brokerageId?: string;
}

interface RequestFinishCreateUserAction {
    type: 'RECEIVE_FINISHCREATEUSER';
}

interface RequestPatchDraftUserAction {
    type: 'REQUEST_PATCHDRAFTUSER';
    user: User;
}

interface RequestPatchUserAction {
    type: 'REQUEST_PATCHUSER';
    user: User;
}

interface ReceivePatchUserAction {
    type: 'RECEIVE_PATCHUSER';
    user: User;
}

interface ReceiveAddUserToRolesAction {
    type: 'RECEIVE_ADDUSERTOROLES';
    id: string;
    roles: string[];
}

interface RequestAddUserToRolesAction {
    type: 'REQUEST_ADDUSERTOROLES';
    id: string;
    roles: string[];
}

interface RequestRemoveUserFromRolesAction {
    type: 'REQUEST_REMOVEUSERFROMROLES';
    id: string;
    roles: string[];
}

interface ReceiveRemoveUserFromRolesAction {
    type: 'RECEIVE_REMOVEUSERFROMROLES';
    id: string;
    roles: string[];
}

interface RequestConfirmationEmailAction {
    type: 'REQUEST_CONFIRMATIONEMAIL';
    id: string;
}

interface ReceiveConfirmationEmailAction {
    type: 'RECEIVE_CONFIRMATIONEMAIL',
    success: boolean,
}

interface RequestStartChangePasswordAction {
    type: 'REQUEST_STARTCHANGEPASSWORD';
    id: string;
}

interface RequestCancelChangePasswordAction {
    type: 'REQUEST_CANCELCHANGEPASSWORD';
    id: string;
}

interface RequestChangePasswordAction {
    type: 'REQUEST_CHANGEPASSWORD';
    id: string;
}

interface ReceiveChangePasswordAction {
    type: 'RECEIVE_CHANGEPASSWORD';
    success: boolean;
    id: string;
}


// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction
    = RequestUsersAction | ReceiveUsersAction
    | RequestUserAction | ReceiveUserAction
    | RequestStartCreateUserAction
    | RequestCreateUserAction | ReceiveCreateUserAction
    | RequestFinishCreateUserAction | RequestPatchDraftUserAction
    | RequestPatchUserAction | ReceivePatchUserAction
    | RequestAddUserToRolesAction | ReceiveAddUserToRolesAction
    | RequestRemoveUserFromRolesAction | ReceiveRemoveUserFromRolesAction
    | RequestConfirmationEmailAction | ReceiveConfirmationEmailAction
    | RequestStartChangePasswordAction | RequestCancelChangePasswordAction | RequestChangePasswordAction | ReceiveChangePasswordAction
    ;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).
export const actionCreators = {
    requestUsers: (search?: string, start?: number, count?: number, roles?: string[] | string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        var path = "api/users";
        var rolesStr;

        var args = URLArgs(
            { name: "search", value: search || "" },
            { name: "roles", value: typeof roles === "string" ? roles : (roles||[]).join(",") },
            { name: "start", value: start || 0, },
            { name: "count", value: count || -1, },
        );

        let fetchTask = Fetch(path + args)
            .then(response => response.json() as Promise<CollectionResults<User>>)
            .then(data => {
                dispatch({ type: 'RECEIVE_USERS', results: data, search, start, count});
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_USERS', search, start, count });
    },

    requestUser: (id: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        var path = "api/users/" + id;
        let fetchTask = Fetch(path)
            .then(response => response.json() as Promise<User>)
            .then(user => {
                dispatch({ type: 'RECEIVE_USER', user });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_USER', id, });
    },

    requestStartCreateBroker: (brokerageId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RECEIVE_STARTCREATEUSER', brokerageId });
    },

    requestStartCreateUser: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RECEIVE_STARTCREATEUSER' });
    },

    requestFinishCreateUser: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RECEIVE_FINISHCREATEUSER' });
    },

    requestPatchDraftUser: (user: User): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'REQUEST_PATCHDRAFTUSER', user });
    },

    requestCreateUser: (user: User, sendNotificationEmail: boolean, confirm: boolean = true): AppThunkAction<KnownAction> => (dispatch, getState) => {
        var args = URLArgs({ name: "email", value: sendNotificationEmail }, { name: "confirm", value: confirm });
        var path = "api/users" + args;

        let fetchTask = Fetch(path, PostJson(user))
            .then(response => response.json() as Promise<CreateUserResponse>)
            .then(response => {
                dispatch({ type: 'RECEIVE_CREATEUSER', response });
            })
            .catch(e => {
                // An empty response will be handled with appropriate fallback state updates.
                dispatch({ type: 'RECEIVE_CREATEUSER', response: { user: undefined } });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_CREATEUSER', user, sendNotificationEmail });
    },


    requestPatchUser: (user: User): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (!user.id)
            return;

        var path = "api/users/" + user.id;
        let fetchTask = Fetch(path, PatchJson(user))
            .then(response => response.json() as Promise<User>)
            .then(user => {
                dispatch({ type: 'RECEIVE_PATCHUSER', user });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_PATCHUSER', user, });
    },

    requestStartChangePassword: (id: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'REQUEST_STARTCHANGEPASSWORD', id,  });
    },

    requestCancelChangePassword: (id: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'REQUEST_CANCELCHANGEPASSWORD', id,  });
    },

    requestChangePassword: (id: string, password: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        var path = `api/users/${id}/changepassword`;
        let fetchTask = Fetch(path, PostJson(password))
            .then(response => response)
            .then(success => {
                dispatch({ type: 'RECEIVE_CHANGEPASSWORD', id, success: success.ok });
            })
            .catch(e => {
                dispatch({ type: 'RECEIVE_CHANGEPASSWORD', id, success: false });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_CHANGEPASSWORD', id,  });
    },

    requestAddUserToRoles: (id: string, roles: string[]): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (!id)
            return;

        var path = `api/users/${id}/roles`;
        let fetchTask = Fetch(path, PostJson(roles))
            .then(response => response as any)
            .then(response => {
                dispatch({ type: 'RECEIVE_ADDUSERTOROLES', roles, id, });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_ADDUSERTOROLES', roles, id, });
    },

    requestRemoveUserFromRoles: (id: string, roles: string[]): AppThunkAction<KnownAction> => (dispatch, getState) => {
        if (!id)
            return;

        var path = `api/users/${id}/roles/` + roles.join(",");
        let fetchTask = Fetch(path, DeleteJson())
            .then(response => response as any)
            .then(response => {
                dispatch({ type: 'RECEIVE_REMOVEUSERFROMROLES', roles, id, });
            }).catch(e => { });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_REMOVEUSERFROMROLES', roles, id, });
    },

    requestConfirmationEmail: (id: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        var path = `api/users/${id}/confirmationemail`;
        let fetchTask = Fetch(path)
            .then(response => response.json() as any)
            .then(user => {
                dispatch({ type: 'RECEIVE_CONFIRMATIONEMAIL', success: true });
            }).catch(e => {
                dispatch({ type: 'RECEIVE_CONFIRMATIONEMAIL', success: false });
            });

        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_CONFIRMATIONEMAIL', id });
    },

};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: UserState = {  };

export const reducer: Reducer<UserState> = (state: UserState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_USERS':
            break;

        case 'RECEIVE_USERS':
            var { list, items } = state;
            var { start, count, search } = action;
            items = Object.assign({}, items || {});

            if (action.start == 0 || !list)
                list = [];
            else
                list = list.map(item => item);

            // append the items.
            if (action.results && action.results.items) {
                action.results.items.forEach((item) => {
                    items && item.id && (items[item.id] = item);
                    list && item.id && list.push(item.id);
                    item.roles && (item.roles = item.roles.sort());
                });
            }

            return Object.assign({}, state, {
                items, list, search, start, count,
                totalCount: action.results ? action.results.totalCount : 0
            });

        case 'REQUEST_USER':
            break;

        case 'RECEIVE_USER':
        case 'RECEIVE_PATCHUSER':
            // These 2 are the same for now.  We take the new user and re-assign it.
            var { list, items } = state;
            var { user } = action;
            if (!user.id)
                break;

            items = Object.assign({}, items || {});
            items[user.id] = user;
            user.roles && (user.roles = user.roles.sort());

            return Object.assign({}, state, { items });

        case 'RECEIVE_STARTCREATEUSER':
            // When creating a user, attach appropriate options to the creation process.
            var memberships = !action.brokerageId ? undefined : [{ brokerageId: action.brokerageId }];
            var roles = !memberships ? undefined : ["broker"];

            return Object.assign({}, state, {
                userToCreate: { memberships, roles },
                creationErrors: undefined,
                creationSucceeded: undefined
            })

        case 'RECEIVE_FINISHCREATEUSER':
            return Object.assign({}, state, {
                userToCreate: undefined,
                creationErrors: undefined,
                creationSucceeded: undefined
            })

        case 'RECEIVE_CREATEUSER':
            var { list, items } = state;
            var { response } = action;
            if (!response)
                break;

            var optionalUser = response.user;
            if (!optionalUser) {
                var { errors } = response;
                if (!errors || errors.length == 0)
                    errors = ["There was an unknown problem creating the user."];
                return Object.assign({}, state, { creationErrors: errors, creationSucceeded: false, creatingUser: false, });
            }

            if (!optionalUser.id)
                break;

            items = Object.assign({}, items || {});
            items[optionalUser.id] = optionalUser;
            list = (list || []).map(id => id);
            list.push(optionalUser.id);

            return Patch(state, { items, list, creationSucceeded: true, creatingUser: false, });

        case 'REQUEST_CREATEUSER':
            return Patch(state, { creatingUser: true });

        case 'REQUEST_PATCHUSER':
            break;

        case 'REQUEST_PATCHDRAFTUSER':
            if (state.userToCreate) {
                var newState = Patch(state, { userToCreate: Object.assign({}, state.userToCreate, action.user) });
                console.log(newState);
                return newState;
            }
            break;

        case 'REQUEST_ADDUSERTOROLES':
            break;

        case 'RECEIVE_ADDUSERTOROLES':
            var stateWithRoles = Patch(state, {});
            if (state.items && stateWithRoles.items) {
                stateWithRoles.items = Object.assign({}, stateWithRoles.items);
                var item = Object.assign({}, state.items[action.id]);
                var roles = item.roles;
                if (roles)
                    roles = roles.map(item => item);
                else
                    roles = [];

                for (var i = 0; i < action.roles.length; ++i)
                    if (!roles.find(f => f == action.roles[i]))
                        roles.push(action.roles[i]);

                item.roles = roles.sort();
                stateWithRoles.items[action.id] = item;

                return stateWithRoles;
            }
            break;

        case 'REQUEST_REMOVEUSERFROMROLES':
            break;

        case 'RECEIVE_REMOVEUSERFROMROLES':
            var stateWithRoles = Object.assign({}, state);
            if (state.items && stateWithRoles.items) {
                stateWithRoles.items = Object.assign({}, stateWithRoles.items);
                var item = Object.assign({}, state.items[action.id]);
                var roles = item.roles;
                if (roles && action)
                    roles = roles.filter(f => !action.roles.find(g => g == f));
                else
                    roles = [];

                item.roles = roles.sort();
                stateWithRoles.items[action.id] = item;

                return stateWithRoles;
            }
            break;

        case 'RECEIVE_CONFIRMATIONEMAIL':
            break;

        case 'REQUEST_CONFIRMATIONEMAIL':
            break;

        case 'REQUEST_STARTCHANGEPASSWORD':
            var passwordChangeActivities = Object.assign({} as { [id: string]: boolean }, state.passwordChangeActivities);
            var passwordChangeErrors = Object.assign({} as { [id: string]: string[] }, state.passwordChangeErrors);
            passwordChangeActivities[action.id] = true;
            delete passwordChangeErrors[action.id];
            return Patch(state, { passwordChangeActivities, passwordChangeErrors });

        case 'REQUEST_CANCELCHANGEPASSWORD':
            var passwordChangeActivities = Object.assign({} as { [id: string]: boolean }, state.passwordChangeActivities);
            var passwordChangeErrors = Object.assign({} as { [id: string]: string[] }, state.passwordChangeErrors);
            delete passwordChangeActivities[action.id];
            delete passwordChangeErrors[action.id];
            return Patch(state, { passwordChangeActivities, passwordChangeErrors });

        case 'REQUEST_CHANGEPASSWORD':
            break;

        case 'RECEIVE_CHANGEPASSWORD':
            var passwordChangeErrors = Object.assign({} as { [id: string]: string[] }, state.passwordChangeErrors);
            var passwordChangeActivities = Object.assign({} as { [id: string]: boolean }, state.passwordChangeActivities);
            if (action.success) {
                delete passwordChangeErrors[action.id];
                delete passwordChangeActivities[action.id];
            }
            else
                passwordChangeErrors[action.id] = ["There was an error changing the password."];

            return Patch(state, { passwordChangeErrors, passwordChangeActivities });

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
