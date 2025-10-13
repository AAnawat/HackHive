import cron from 'node-cron';
import deleteSession from './core/deleteSession.js';
import querySessions from './core/queryTask.js';
import stopTask from './core/stopTask.js';

cron.schedule('* * * * *', async () => {
    try {

        const tasks = await querySessions();
        console.log(tasks.map(t => t.task_arn));

        if (tasks.length > 0) {
            stopTask(tasks.map(t => t.task_arn))
            .then(() => {
                console.log(`Stopped tasks: ${tasks.map(t => t.task_arn).join(', ')}`);
            })
            .catch((error) => {
                console.error("Error stopping tasks:", error);
            })
            await deleteSession(tasks.map(t => t.id));
        }
    
        console.log(`Checked at ${new Date().toISOString()}`);
        
    } catch (error) {
        console.log("Error in scheduler:", error);
    }
});