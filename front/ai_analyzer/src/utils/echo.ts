import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// 🔹 បង្ខំឱ្យប្រព័ន្ធស្គាល់ Pusher នៅក្នុង Global Window object
(window as any).Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    // 🔹 វាយបញ្ចូល App Key របស់ Reverb របស់បងចំៗត្រង់នេះ ដើម្បីការពារដាច់ខាតកុំឱ្យលោត Undefined ទៀត
    key: 'lakxud7tc2qmadcezmur', 
    wsHost: '127.0.0.1',
    wsPort: 8085,
    wssPort: 8085,
    forceTLS: false,
    encrypted: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true, // ដក Warning option ចាស់ចេញ
});

export default echo;