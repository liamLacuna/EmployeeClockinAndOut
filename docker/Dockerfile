FROM node:12.19
MAINTAINER Chris Yang <zuodong.zhou@sjsu.edu>

ADD code /app
WORKDIR /app
RUN npm install mysql express

RUN chmod +x entrypoint.sh
VOLUME /app/config

EXPOSE 8080
CMD ["/app/entrypoint.sh"]
