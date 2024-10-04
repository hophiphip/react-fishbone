export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

export function getPartitionPoint({
	sourceX,
	sourceY,
	targetX,
	targetY,
	part,
}: {
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	part: number;
}) {
	const xOffset = Math.abs(targetX - sourceX) * part;
	const partX =
		targetX < sourceX
			? clamp(targetX + xOffset, targetX, sourceX)
			: clamp(targetX - xOffset, sourceX, targetX);

	const yOffset = Math.abs(targetY - sourceY) * part;
	const partY =
		targetY < sourceY
			? clamp(targetY + yOffset, targetY, sourceY)
			: clamp(targetY - yOffset, sourceY, targetY);

	return [partX, partY, xOffset, yOffset];
}
