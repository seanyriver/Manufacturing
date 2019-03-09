import * as React from 'react';

export interface ComponentProps {
    onAdd?: (content: string) => any,
}

export interface CustomConfig {
    id?: string,
    iconSuffix?: string,
    title?: string,
    label?: string,
    componentProps?: any,
    component?: any,
}