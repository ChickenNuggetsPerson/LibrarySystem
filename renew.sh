echo Make sure to run the server in http mode

sudo certbot renew

sudo cp /etc/letsencrypt/live/library.steeleinnovations.com/cert.pem cert.pem
sudo cp /etc/letsencrypt/live/library.steeleinnovations.com/privkey.pem privkey.pem
