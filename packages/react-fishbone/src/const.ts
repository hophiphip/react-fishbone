export const rootId = 'root';
export const tailId = 'tail';

export const nodeWidth = 150;
export const nodeHeight = 50;
export const connectorSize = 1;
export const nodesAngle = 50;
export const xGap = 100;
export const yGap = 50;

export function getIsHorizontal(depth: number) {
	return depth % 2 === 0;
}
