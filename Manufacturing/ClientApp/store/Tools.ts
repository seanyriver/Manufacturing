export const PostJson = (body: any) => {
    return {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    };
};

export const PatchJson = (body: any) => {
    return {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    };
};


export const PutJson = (body: any) => {
    return {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    };
};

export const DeleteJson = () => {
    return { method: "DELETE" };
};

interface URLArg {
    name: string,
    value?: any,
    converter?: (id: any) => string
}

export const URLArgs = (...items: URLArg[]) => {
    var tmp : string[] = [];
    var defaultConverter = (value: any) => { return value; };

    for (let i = 0; i < items.length; ++i) {
        var item = items[i];
        var { converter, value } = item;

        if (!value)
            continue;

        if (!converter)
            converter = defaultConverter;

        tmp.push(item.name + "=" + converter(item.value));
    }

    if (tmp.length == 0)
        return "";

    return "?" + tmp.join("&");
}

var ClientId_Counter = 0;
var ClientId_Prefix = new Date(Date.now()).getUTCMilliseconds();

// We try to ensure that client IDs never conflict, and also that
// if the browser is reloaded, new IDs will not conflict with old IDs.
export const ClientId = () => {
    return "client_" + ClientId_Prefix + ClientId_Counter++;
}

export const EmptyDateTime = () => {
    return "1/1/0001 12:00:00 AM +00:00";
};

export const FormatDate = (d?: Date) => !d ? null : d.toLocaleDateString(!window || !window.navigator ? undefined : window.navigator.language);

export function Patch<T> (state: T, patch: Partial<T>) {
    return Object.assign({}, state, patch) as T;
}

export function DurationTitle(durationDays: number) {
    return durationDays == 730 ? "2 Years" :
        durationDays == 365 ? "1 Year" :
        durationDays == 1 ? "1 Day" :
        durationDays + " Days";
}

export function AddOrUpdate<T>(items: T[] | undefined, item: T, discrim: (existingItem: T, newItem: T) => boolean, op?: (existingItem: T, newItem: T) => T) {
    if (!items)
        return [item];

    var found = false;
    var tick = (item: T) => { found = true; return item; };

    items = items.map(existingItem => discrim(existingItem, item) ? tick(! op ? item : op(existingItem,item)) : existingItem);
    return tick ? items : items.concat([item]);
}

export function LogChange<T>(items: { [id: string]: T[] } | undefined, key: string, item: T, discrim: (existingItem: T, newItem: T) => boolean)
{
    // Create the items object with the key mappped to a 1-item list.
    if (!items)
        return { [key]: [item] };

    var itemList = items[key];
    if (!itemList) {
        // Patch the items object with the key mapped to a 1-item list.
        return Patch(items, { [key]: [item] });
    }

    var found = false;
    var tick = (item: T) => { found = true; return item; };

    // Try to patch an item in the item list of it exists.
    itemList = itemList.map(existingItem => discrim(existingItem, item) ?
        tick(Patch(existingItem, item)) : existingItem);

    // Patch the items object with the key mapped to the new item list.
    return Patch(items, {
        [key]: tick ?  itemList :
             // If the item isn't found, add it to the item list.
            itemList.concat(item)
    });
}

export function LogRemoval<T>(items: { [id: string]: T[] } | undefined, key: string, discrim: (existingItem: T) => boolean) {
    // Create the items object with no keys.
    if (!items)
        return {  };

    var itemList = items[key];
    if (!itemList) {
        // Patch the items object with the key mapped to no items.
        return Patch(items, { });
    }

    var found = false;
    var tick = (item: T) => { found = true; return item; };

    // Filter the list.  We negate the discrim since it indicates whether the item is to be removed,
    // and the filter function returns all items that DO match the test.
    itemList = itemList.filter(existingItem => !discrim(existingItem));

    // Patch the items object with the filtered list.
    return Patch(items, { [key]: itemList });
}
