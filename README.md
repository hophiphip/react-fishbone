# React Fishbone

React fishbone ([Ishikawa](https://en.wikipedia.org/wiki/Ishikawa_diagram)) diagram component.

## Installation

```console
npm i @hophiphip/react-fishbone
```

## Usage

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

## API

### **FishboneNode**

Fishbone diagram node.

| Property | Type                                             | Description          |
|:--------:|:------------------------------------------------:|:---------------------|
| name     | `string`                                         | Node text contents   |
| children | [FishboneNode](#fishbonenode)[], `undefined`     | Node nested children |

### **FishboneProps**

Fishbone component props.

| Property     | Type                                        | Description                       |
|:------------:|:-------------------------------------------:|:----------------------------------|
| width        | `string`, `number`, `undefined`             | Component width                   |
| height       | `string`, `number`, `undefined`             | Component height                  |
| items        | [FishboneNode](#fishbonenode), `undefined`  | Compoent node items               |
| wrapperStyle | `React.CSSProperties`, `undefined`          | Component wrapper `<div />` style |

### Storybook 

Building/Running storybook might cause an error

```text
Error: error:0308010C:digital envelope routines::unsupported
```

That error appears in `NodeJS` versions `> 16`. Temporary solution is to set `NODE_OPTIONS` to `--openssl-legacy-provider`

```console
cross-env NODE_OPTIONS=--openssl-legacy-provider npm run storybook
cross-env NODE_OPTIONS=--openssl-legacy-provider npm run build-storybook
```