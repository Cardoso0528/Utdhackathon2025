import { useSyncExternalStore } from "react";

type ToastRecord = {
    id: string;
    title?: string;
    description?: string;
    action?: any;
    // allow arbitrary extra props used by consumers
    [key: string]: any;
};

let toasts: ToastRecord[] = [];
const listeners = new Set<() => void>();

function notify() {
    for (const l of listeners) l();
}

export const toast = {
    open(payload: Omit<ToastRecord, 'id'>) {
        const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
        toasts = [{ id, ...payload }, ...toasts];
        notify();
        return id;
    },
    close(id: string) {
        toasts = toasts.filter((t) => t.id !== id);
        notify();
    },
    // convenience alias
    show(payload: Omit<ToastRecord, 'id'>) {
        return this.open(payload);
    },
};

function getSnapshot() {
    return toasts;
}

function subscribe(cb: () => void) {
    listeners.add(cb);
    return () => void listeners.delete(cb);
}

export function useToast() {
    const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return { toasts: store, toast };
}

export default useToast;
