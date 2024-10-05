import { createContext, useContext } from "react";

export const FishboneDebugContext = createContext<boolean | undefined>(undefined);
export const FishboneDebugProvider = FishboneDebugContext.Provider;
export const FishboneDebugConsumer = FishboneDebugContext.Consumer;

export const useIsFishboneDebug = (): boolean | undefined => {
    const isFishboneDebug = useContext(FishboneDebugContext);
    return isFishboneDebug;
};

export default FishboneDebugContext;