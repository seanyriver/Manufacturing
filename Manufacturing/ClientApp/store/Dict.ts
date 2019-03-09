type DictKey = string | number;

export interface Dict<T,U extends DictKey =string> {
    [id: string]: T
} ;