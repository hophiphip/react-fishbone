# Migrating from one packages version to the next one

## Migrate from 0.4.x to 0.5.x
Removed `d3` dependency in favor of `xyflow`.

- Props `width`, `height`, `linesConfig`, `nodesConfig`, `wrapperStyle` were removed. Use `reactFlowProps` for customizing internal chart instead.
- `FishboneNode` model was changed, prop `name` renamed to `label` and can now be `ReactNode`.