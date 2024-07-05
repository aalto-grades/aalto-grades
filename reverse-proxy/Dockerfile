# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM nginx:1.27-alpine
EXPOSE 80

ARG CERT_FILE
ARG CERT_KEY_FILE

COPY reverse-proxy.conf /etc/nginx/conf.d/default.conf
COPY $CERT_FILE /etc/ssl/certs/aalto-grades.cs.aalto.fi.crt
COPY $CERT_KEY_FILE /etc/ssl/private/aalto-grades.cs.aalto.fi.key
CMD ["nginx", "-g", "daemon off;"]
