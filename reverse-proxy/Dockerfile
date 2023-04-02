# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM nginx:1.23.3-alpine
EXPOSE 80

ARG CERT_LOCATION
ARG CERT_KEY_LOCATION

COPY reverse-proxy.conf /etc/nginx/conf.d/default.conf
COPY $CERT_LOCATION /etc/ssl/certs/aalto-grades.cs.aalto.fi.crt
COPY $CERT_KEY_LOCATION /etc/ssl/private/aalto-grades.cs.aalto.fi.key
CMD ["nginx", "-g", "daemon off;"] 