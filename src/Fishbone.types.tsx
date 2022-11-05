import React from 'react';

export type FishboneNode = {
    name: string;
    children?: FishboneNode[];
};

export type FishboneProps = {
    width?: string | number;
    height?: string | number;
    items?: FishboneNode;
    wrapperStyle?: React.CSSProperties;
};