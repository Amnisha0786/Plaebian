/**
 *
 * @param d1 The first date object
 * @param d2 The second date object
 * @returns True if the two dates are the same day, false otherwise
 */
export const compareDates = (d1: Date, d2: Date) => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};
