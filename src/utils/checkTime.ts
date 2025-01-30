import { DateTime } from "luxon";

export const checkAllowedTime = (userTimeZone: string, startAt: DateTime, endAt: DateTime): boolean => {
    try {
        // 1. Convert Start and End Times to User's Timezone
        const startTimeInUserZone = startAt.setZone(userTimeZone);
        const endTimeInUserZone = endAt.setZone(userTimeZone);

        // 2. Get Current Time in User's Timezone
        const now = DateTime.now().setZone(userTimeZone);

        // 3. Check if Current Time is Within Allowed Window
        const isAllowed = now >= startTimeInUserZone && now <= endTimeInUserZone;
        return isAllowed;
        // return now.isAfter(startTimeInUserZone) && now.isBefore(endTimeInUserZone);
    } catch (error) {
        console.error("Error checking allowed time:", error);
        return false; // Handle errors gracefully (e.g., log and return false)
    }
};