# React Fishbone

Fishbone ([Ishikawa](https://en.wikipedia.org/wiki/Ishikawa_diagram)) chart component for React.

## Installation

```bash
npm install @hophiphip/react-fishbone
```

## Usage

```tsx
import Fishbone from '@hophiphip/react-fishbone';
import '@hophiphip/react-fishbone/style.css';

export default () => {
    return (
        <Fishbone
			items={{
				label: "Root",
				children: [
					{
						label: "Node 1",
						children: [
							{
								label: "Node 1-1",
								children: [
									{
										label: "Node 1-1-1",
									},
								],
							},
							{
								label: "Node 1-2",
							},
							{
								label: "Node 1-3",
							},
						],
					},
					{
						label: "Node 2",
						children: [
							{
								label: "Node 2-1",
							},
							{
								label: "Node 2-2",
							},
							{
								label: "Node 2-3",
							},
						],
					},
					{
						label: "Node 3",
					},
					{
						label: "Node 4",
					},
					{
						label: "Node 5",
						children: [
							{
								label: "Node 5-1",
							},
							{
								label: "Node 5-2",
							},
							{
								label: "Node 5-3",
							},
						],
					},
				],
			}}
		/>
    );
};
```

## API

### FishboneNode

Fishbone tree node element

| Property | Type | Description |
|:--------:|:-----------------------------:|:----------------------------------------------------:|
| label    | `ReactNode`                   | Contents of fishbone tree node                       |
| children | [FishboneNode](#fishbonenode)[] or `undefined` | Nested fishbone tree children-nodes                  |

### FishboneProps

| Property       | Type           | Description             |
|:--------------:|:--------------:|:-----------------------:|
| items          | [FishboneNode](#fishbonenode)   | Fishbone tree root node |
| reactFlowProps | [ReactFlowProps](https://reactflow.dev/api-reference/react-flow#common-props) | React flow props        |

### Dependencies

React fishbone component is based on [xyflow](https://github.com/xyflow/xyflow/tree/main).
