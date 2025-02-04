import cron from 'node-cron';
// import { sendEmailReminder } from '../controllers/cronJobsController';

const { URL_BOTS } = process.env;

export function initCronJobs() {
    cron.schedule('* * * * *', async () => {
        const request = await fetch(`${URL_BOTS}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        const response = await request.json();
        console.log(response);
    });
}