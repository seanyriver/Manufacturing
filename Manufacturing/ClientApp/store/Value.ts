import { Address } from "./Address";

export interface Value {
    id?: string;
    type?: string;
}

export interface StringBasedValue extends Value {
    value?: string,
    format?: string;
}

export interface TextValue extends StringBasedValue {
    hints?: string[];
}

export interface NotesValue extends StringBasedValue {
}

export interface NumericBasedValue extends Value {
    value?: number;
}

export interface IntegerValue extends NumericBasedValue {
}

export interface DoubleValue extends NumericBasedValue {
}

export interface DecimalValue extends NumericBasedValue {
}

export interface CurrencyValue extends NumericBasedValue {
    currency?: string;
}

export interface DateValue extends Value {
    value?: Date;
}

export interface BoolValue extends Value {
    value?: boolean;
}

export interface SelectValue extends Value {
    value?: string;
    selectType?: string;
    allowMultiple?: boolean;
    values?: string[];
}

export interface AddressValue extends Value {
    value?: Address;
}

export type AnyValue = IntegerValue | DoubleValue | DecimalValue | DateValue | BoolValue | SelectValue | AddressValue | CurrencyValue;

export const FormatDate = (d?: Date) => !d ? null : d.toLocaleDateString(!window||!window.navigator ? undefined : window.navigator.language);

export const ValueToString: any = {
    "notes": (vo: any) => vo.value ,
    "text": (vo: any) => vo.value ,
    "bool": (vo: any) => vo.value,
    "currency": (vo: any) => vo.value,
    "integer": (vo: any) => vo.value ,
    "double": (vo: any) => vo.value ,
    "date": (vo: any) => FormatDate (new Date(vo.value)) ,
    "select": (vo: any) => vo.value,
};