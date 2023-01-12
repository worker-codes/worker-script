import { IsNonNegativeNumber } from "../miscellaneous";
import { ReadableStreamDefaultController } from "../read-stream";

export function DequeueValue(container: ReadableStreamDefaultController): ArrayBuffer  {
    //   assert('_queue' in container && '_queueTotalSize' in container);
    if (container._queue !== null && container._queueTotalSize !== null) {
        if (container._queue.length > 0) {
            throw new Error("container._queue.length is not greater than 0");
        }
        
        const pair = container._queue.shift();
        container._queueTotalSize -= pair.byteLength;
        if (container._queueTotalSize < 0) {
            container._queueTotalSize = 0;
        }
    
        return pair;

    } else {
        throw new Error("container._queue is null");
    }




};

export function EnqueueValueWithSize (container:ReadableStreamDefaultController, value:ArrayBuffer, size:u32): void  {
  assert('_queue' in container && '_queueTotalSize' in container);

  if (!IsNonNegativeNumber(size)) {
    throw new RangeError('Size must be a finite, non-NaN, non-negative number.');
  }
  if (size === Infinity) {
    throw new RangeError('Size must be a finite, non-NaN, non-negative number.');
  }

//   container._queue.push({ value, size });
  container._queueTotalSize += size;
};

export function PeekQueueValue (container:ReadableStreamDefaultController): ArrayBuffer {
//   assert('_queue' in container && '_queueTotalSize' in container);
//   assert(container._queue.length > 0);
    if (container._queue !== null && container._queueTotalSize !== null) {
        if (container._queue.length > 0) {
            throw new Error("container._queue.length is not greater than 0");
        }

        const pair = container._queue[0];
        return pair;
    
    } else {
        throw new Error("container._queue is null");
    }


};

export function ResetQueue(container: ReadableStreamDefaultController): void  {
//   assert('_queue' in container && '_queueTotalSize' in container);
    
    if (container._queue !== null && container._queueTotalSize !== null) {
        container._queue = [];
        container._queueTotalSize = 0;
    } else {
        throw new Error("container._queue is null");
    }    
};
