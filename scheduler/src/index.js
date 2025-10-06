import cron from 'node-cron';

import deleteSession from './core/deleteSession.js';
import querySessions from './core/queryTask.js';
import stopTask from './core/stopTask.js';

cron.schedule('* * * * *', async () => {
    try {

        const tasks = await querySessions();
        
        for (const task of tasks) {
            await stopTask([task.task_arn]);
            await deleteSession(task.id);
        }
    
        console.log(`Checked at ${new Date().toISOString()}`);
        
    } catch (error) {
        console.log("Error in scheduler:", error);
    }
});