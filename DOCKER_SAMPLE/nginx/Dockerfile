FROM nginx
WORKDIR /etc/nginx/conf.d
RUN rm -rf /etc/nginx/conf.d/*
COPY ./prod.conf /etc/nginx/conf.d/default.conf
COPY ./default.conf ./default.conf
COPY ./.ssl/cert.pem /etc/ssl/cert.pem
COPY ./.ssl/key.pem /etc/ssl/key.pem
COPY ./.ssl/cloudflare.crt /etc/ssl/cloudflare.crt

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]