import { TextEditor } from "./TextEditor";
import * as React from 'react';
//import SelectEditor from "./SelectEditor";
import DateEditor from "./DateEditor";
import AddressEditor from "./AddressEditor";

interface EditorProps {
    initialValue: any,
    type?: string,
    selectType?: string,
    onChange: any,
    immediate?: boolean,
    alwaysEdit?: boolean,
    onInput?: any,
    onCancel: any,
    textOptions?: string[],
    className?: string,
}

export default function AttributeEditor(props: EditorProps) {
    if (props.type == "text" || props.type == "notes")
        return <TextEditor type={props.type} onInput={props.onInput} {...props} />;

    if (props.type == "integer" || props.type == "double" || props.type == "currency")
        return <TextEditor {...props} type='text' />;

    if (props.type == "address")
        return <AddressEditor {...props} />;

    if (props.type == "date")
        return <DateEditor {...props}
            onClear={() => { props.onChange(null); }}
            onChange={props.onChange}
            onCancel={props.onCancel}
        />;

    //if (props.type == "select")
        //return <SelectEditor {...props}
            //selectType={props.selectType}
            //onChange={props.onChange}
            //onCancel={props.onCancel}
            //onClear={() => { props.onChange(null); }} />;

    if (props.type == "bool")
        return <input type='checkbox' checked={props.initialValue} onClick={() => {
            props.onChange(!props.initialValue);
        }} onBlur={() => { props.onCancel(); }} />;

    return null;
}