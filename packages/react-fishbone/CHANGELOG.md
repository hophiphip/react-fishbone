## Version 0.5.x

Current latest fishbone chart version.
For more info see [README](README.md)

## Version 0.4.x

Initial fishbone chart implementation based on `d3` and `d3-force`.

### Installation

```bash
npm i @hophiphip/react-fishbone@0.4.1
```

### Usage

Import the component

```tsx
import Fishbone from '@hophiphip/react-fishbone';
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

### API

#### **FishboneNode**

Fishbone diagram node.

| Property | Type                                             | Description     |
|:--------:|:------------------------------------------------:|:----------------|
| name     | `string`                                         | Text content    |
| children | [FishboneNode](#fishbonenode)[], `undefined`     | Nested children |

#### **LineConfig**

Fishbone line/link parameters for specific level of nesting

| Property      | Type      | Description          |
|:-------------:|:---------:|:---------------------|
| color         | `string`  | Line color           |
| strokeWidthPx | `number`  | Line width in `px`   |

#### **NodeConfig**

Fishbone node parameters for specific level of nesting

| Property      | Type      | Description          |
|:-------------:|:---------:|:---------------------|
| color         | `string`  | Text color           |
| fontSizeEm    | `number`  | Text size in `em`    |


#### **FishboneProps**

Fishbone component props.

| Property     | Type                                        | Description                                     |
|:------------:|:-------------------------------------------:|:------------------------------------------------|
| width        | `string`, `number`, `undefined`             | Component width                                 |
| height       | `string`, `number`, `undefined`             | Component height                                |
| items        | [FishboneNode](#fishbonenode), `undefined`  | Component node items                            |
| linesConfig  | [LineConfig](#lineconfig)[], `undefined`    | Component line config for each level of nesting |
| nodesConfig  | [NodeConfig](#nodeconfig)[], `undefined`    | Component node items for each level of nesting  |
| wrapperStyle | `React.CSSProperties`, `undefined`          | Component wrapper `<div />` style               |