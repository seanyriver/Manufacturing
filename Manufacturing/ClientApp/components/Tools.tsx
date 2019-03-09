import { Value, TextValue, IntegerValue, DoubleValue, DecimalValue, NotesValue, BoolValue, SelectValue, DateValue, AddressValue } from "../store/Value";
//import Attribute from "../store/Attribute";
import { DOMElement } from "react";
import { Address } from "../store/Address";

var typeToText: {
    [key: string]: any
};

typeToText = {
    "text": (v : Value) => (v as TextValue).value,
    "notes": (v : Value) => (v as NotesValue).value,
    "bool": (v : Value) => (v as BoolValue).value,
    "integer": (v : Value) => (v as IntegerValue).value,
    "decimal": (v : Value) => (v as DecimalValue).value,
    "double": (v : Value) => (v as DoubleValue).value,
    "date": (v : Value) => (v as DateValue).value,
    "select": (v : Value) => (v as SelectValue).value,
    "address": (v: Value) => {
        var av = v as AddressValue;
        var a = av.value;
        if (!a)
            return "";

        var items: any[] = [];
        if (a.property || a.street) {
            items.push(a.property ? a.property + (a.street ? " " + a.street : "") : a.street);
        }
        if (a.line3) {
            items.push(a.line3);
        }
        if (a.city) {
            items.push(a.city);
        }
        if (a.country) {
            items.push(a.country);
        }
        if (a.postcode) {
            items.push(a.postcode);
        }

        return items.join("\n");
    },
};

var typeToRaw: {
    [key: string]: any
};

/**
 * Converts the value attribute of @value based on the type of the original value.
 * For example, if the original was text and the target is bool, then it will only be
 * true if the source value is the string "true".
 * 
 * @param value
 * @param originalValue
 */
export function ConvertValue(value?: any, originalValue?: any): any {
    if (!value)
        return false;
    if (!originalValue)
        return false;

    var tmp: any;
    tmp = ConvertValueMappings[originalValue.type];
    if (!tmp)
        return false;

    tmp = tmp[value.type];

    if (!tmp)
        return false;

    value.value = tmp(value.value);
    return true;
}

var ConvertValueMappings: {
    [id: string] : { [id: string] : any }
};

ConvertValueMappings = {
    "bool": {
        "text": (v: any) => { return v == true ? "true" : "false"; }
    },
    "text": {
        "bool": (v: any) => { return v == "true"; },
        "notes": (v: any) => { return v; }
    },
    "notes": {
        "bool": (v: any) => { return HtmlToText(v) == "true"; },
        "text": (v: any) => { return HtmlToText(v); }
    }
};

export function GetValueAsText(v?: Value) : any {
    if (!v)
        return null;

    if (!v.type)
        return null;

    var converter:any = typeToText[v.type];
    if (converter)
        return converter(v);

    return null;
}

export function HtmlToText(v?: string): any {
    if (!v)
        return "";
    return v.replace(/[<][^>]*[>]/g, "");
}

/*
export function GetValueFromText(attr: Attribute, value : any) {
    var type = (attr && attr.value && attr.value.type) ? attr.value.type : "text";

    if (type == "text" || type == "notes")
        value = { type: type, value: value };
    else if (type == "integer")
        value = { type: type, value: Number.parseInt(value) };
    else if (type == "double")
        value = { type: type, value: Number.parseFloat(value) };
    else if (type == "bool")
        value = { type: type, value: value };
    else if (type == "select")
        value = { type: type, selectType: (attr.value as SelectValue).selectType, value: value };
    else if (type == "date")
        value = { type: type, value: !value || value == "" ? null : new Date(value) };
    else
        value = undefined;

    return value;
}
*/

/**
 * Cleans HTML by removing certain aspects from it during a paste operation.
 * 
 * @param html
 */
export function CleanHTML(html: string) : string {
    var elem = document.createElement("div");
    elem.innerHTML = html;

    CleanNode(elem);
    //console.log(elem.innerHTML);
    return elem.innerHTML;
}

function CleanNode(element: Node): boolean {
    var toRemove: Node[] = [];
    for (var i = 0; i < element.childNodes.length; ++i) {
        var node = element.childNodes.item(i);
        var result = CleanNode(node);

        if (!result)
            toRemove.push(node);
    }
    for (var i = 0; i < toRemove.length; ++i)
        element.removeChild(toRemove[i]);

    //console.log("NODE TYPE: " + element.nodeType);
    if (element.nodeType == Node.ELEMENT_NODE) {
        CleanElement(element as HTMLElement);
        return ! /style|meta|link/i.test(element.nodeName);
    }
    else if (element.nodeType == Node.TEXT_NODE)
        return true;
    else
        return false;
}

function CleanElement(element: HTMLElement) {
    element.style.font = null;
}