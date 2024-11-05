import { Result, WithPower } from '../shared/types';

// Transfers power between any two objects that implement `WithPower`
export const transferPower = (
    from: WithPower,
    to: WithPower,
    i: number
): Result<null, Error> => {
    if (from.power <= 0 || from.power < i)
        return [null, new Error('Error: not enough power to transfer')];

    if (!to.power) to.power = 0;

    // this should probably deal with overflow at some point, i.e.
    // video.power = Math.min(Math.max(0, power), 2147483647);
    from.power -= i;
    to.power += i;

    return [null, null];
};
