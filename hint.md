<!-- start app -->
pm2 start dist/index.js --name api-webhook 
<!-- save app -->
pm2 save 
<!-- automatic start when booting -->
pm2 startup
<!-- realtime log -->
pm2 logs api-webhook
<!-- check status -->
pm3 status