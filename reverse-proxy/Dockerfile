# SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
#
# SPDX-License-Identifier: MIT

FROM nginx:1.23.3-alpine
EXPOSE 80
COPY reverse-proxy.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"] 