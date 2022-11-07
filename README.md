# React Fishbone

React fishbone ([Ishikawa](https://en.wikipedia.org/wiki/Ishikawa_diagram)) diagram component.

## Installation

```console
npm i @hophiphip/react-fishbone
```

## Usage

Import component and styles

```tsx
import Fishbone from '@hophiphip/react-fishbone';
import '@hophiphip/react-fishbone/dist/index.css';
```

Component usage example

```tsx
<Fishbone 
    items={{
        "name": "Flaws",
        "children": [
            {
                "name": "Machines",
                "children": [
                    {"name": "Speed"},
                    {"name": "Bits"},
                    {"name": "Sockets"}
                ]
            }
        ]
    }}
    wrapperStyle={{ 
        width: 1000, 
        height: 500,
    }}
/>
```

## API

### **FishboneNode**

Fishbone diagram node.

| Property | Type                 |
|:--------:|:--------------------:|
| name     | `string`             |
| children | [FishboneNode](###**FishboneNode**)[]     |

### **FishboneProps**

| Property | Type                  |
|:--------:|:---------------------:|
| width     | `string` |\ `number` |
| height    | `string` |\ `number` |
| items     | [FishboneNode](###**FishboneNode**)       |
| wrapperStyle | `React.CSSProperties`  |