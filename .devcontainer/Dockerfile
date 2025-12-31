FROM mcr.microsoft.com/devcontainers/javascript-node:20

# Oracle Instant Client installation
# Note: libaio1 -> libaio1t64 in Debian Trixie
RUN apt-get update && apt-get install -y libaio1t64 wget unzip \
    && wget https://download.oracle.com/otn_software/linux/instantclient/2340000/instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    && unzip instantclient-basiclite-linux.x64-23.4.0.24.05.zip -d /opt/oracle \
    && rm instantclient-basiclite-linux.x64-23.4.0.24.05.zip \
    && echo /opt/oracle/instantclient_23_4 > /etc/ld.so.conf.d/oracle-instantclient.conf \
    && ldconfig \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Oracle environment variables
ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_23_4:$LD_LIBRARY_PATH
ENV PATH=/opt/oracle/instantclient_23_4:$PATH

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli
