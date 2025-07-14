import schedule from 'node-schedule';
import accessWeb from './access-web.js';

console.log("✅ CCTV Scheduler Service Started");
accessWeb();


// Schedule pertama: 6:25 AM setiap hari
schedule.scheduleJob('25 6 * * *', () => {
    console.log("⏰ Mulai accessWeb jam 6:25 AM");
    accessWeb();
});

// Schedule kedua: 14:55 PM setiap hari
schedule.scheduleJob('55 14 * * *', () => {
    console.log("⏰ Mulai accessWeb jam 14:55 PM");
    accessWeb();
});