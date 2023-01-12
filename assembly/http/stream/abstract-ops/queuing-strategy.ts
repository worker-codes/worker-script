import { QueuingStrategy } from "../read-stream";

export let ExtractHighWaterMark = (strategy:QueuingStrategy | null, defaultHWM:u32):u32 => {
    if (strategy === null) {
        return defaultHWM;
    }
   
    if (strategy.highWaterMark === -1 ) {
        return defaultHWM;
    }


    const highWaterMark = strategy.highWaterMark;
    if (Number.isNaN(highWaterMark) || highWaterMark < 0) {
        throw new RangeError('Invalid highWaterMark');
    }

    return highWaterMark;
};

export let ExtractSizeAlgorithm = (strategy: QueuingStrategy | null):(chunk: u32)=>u32 => {
    if (strategy === null) {
        return () => 1;
    }
    
    const size = strategy.size;

     // This is silly, but more obviously matches the spec (which distinguishes between algorithms and JS functions).
    return size;
};
