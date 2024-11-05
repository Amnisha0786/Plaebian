import { nanoid } from 'nanoid';
import cron from 'node-cron';
import { Account } from '../entities/Account';
// cron.schedule(
//     '0 8 * * *',
//     () => {
//         console.log('running a task every minute');
//     },
//     {
//         timezone: 'America/New_York',
//     }
// );

class TimeKeeper {
    tasks: Map<string, cron.ScheduledTask> = new Map();
    constructor(private timezone: string) {}

    addTask(cronExpression: string, func: (now: Date) => void) {
        let key = nanoid();
        while (this.tasks.has(key)) {
            key = nanoid();
        }

        // if (!this.tasks.has(key)) {
        //     const task = cron.schedule(cronExpression, func, {
        //         timezone: this.timezone,
        //     });
        //     this.tasks.set(key, task);
        // }
        return key;
    }

    addDailyTask(func: (now: Date) => void, time?: string) {
        const cronExpression = `0 ${time || '8'} * * *`;
        return this.addTask(cronExpression, func);
    }

    getTask(key: string) {
        return this.tasks.get(key);
    }

    removeTask(key: string) {
        const task = this.getTask(key);
        if (task) {
            task.stop();
            this.tasks.delete(key);
            return true;
        }
        return false;
    }
}

export const timeKeeper = new TimeKeeper('America/New_York');
timeKeeper.addDailyTask((now) => {
    console.log(`${now.toISOString()}: running mass transfer of Account power`);
    Account.massTransferPower();
});
