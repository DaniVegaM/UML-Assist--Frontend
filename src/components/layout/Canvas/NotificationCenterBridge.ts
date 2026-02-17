import type { NotificationCenterType } from "./NotificationCenterContext";

type PushFn = (n: { type: NotificationCenterType; title: string; description?: string }) => void;

let pushFn: PushFn | null = null;

export function setNotificationCenterPush(fn: PushFn) {
    pushFn = fn;
}

export function pushToNotificationCenter(n: { type: NotificationCenterType; title: string; description?: string }) {
    pushFn?.(n);
}
