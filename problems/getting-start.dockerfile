FROM aunanawat/hackhive-baseimage:v1

ENV FLAG="flag{testing_flag_12345}"

RUN echo $FLAG > /home/player/flag.txt

ENV FLAG=

WORKDIR /server

CMD ["node", "index.js"]