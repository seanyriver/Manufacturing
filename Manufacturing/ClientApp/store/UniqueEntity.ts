export default interface UniqueEntity {
    id?: string;
    archived?: boolean;
    deleted?: Date;
    modified?: Date;
    created?: Date;
}

export function PrepareUniqueEntity<T extends UniqueEntity>(item: T) : T {
    if (item.created)
        item.created = new Date(Date.parse(item.created as any));

    if (item.modified)
        item.modified = new Date(Date.parse(item.modified as any));

    if (item.deleted)
        item.deleted = new Date(Date.parse(item.deleted as any));

    return item;
}