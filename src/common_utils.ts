export function sleep(ms: number): { promise: Promise<void>, cancel: () => void } {
    let timeoutId: NodeJS.Timeout;
    const promise = new Promise<void>((resolve) => {
        timeoutId = setTimeout(resolve, ms);
    });
    const cancel = () => clearTimeout(timeoutId);
    return { promise, cancel };
}