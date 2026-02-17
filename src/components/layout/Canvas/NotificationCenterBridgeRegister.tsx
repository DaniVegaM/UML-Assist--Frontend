import { useEffect } from "react";
import { useNotificationCenter } from "../../../contexts/NotificationCenterContext";
import { setNotificationCenterPush } from "./NotificationCenterBridge"; // o ./notificationCenterBridge (según tu nombre real)

export default function NotificationCenterBridgeRegister() {
    const { push } = useNotificationCenter();

    useEffect(() => {
        setNotificationCenterPush(push);
    }, [push]);

    return null;
}
