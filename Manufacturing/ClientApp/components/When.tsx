import * as React from 'react';

export default function When(props: any) {
    if (props.c)
        return <span>{props.children}</span>;

    return <span/>;
}