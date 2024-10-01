FROM mcr.microsoft.com/devcontainers/base:noble

ARG USERNAME=vscode
ARG WORKSPACE_FOLDER=/workspaces/nextjs-with-lambda-web-adapter

RUN mkdir -p $WORKSPACE_FOLDER/aws/node_modules \
    && chown -R $USERNAME:$USERNAME $WORKSPACE_FOLDER/aws/node_modules

RUN mkdir -p $WORKSPACE_FOLDER/frontend/node_modules \
    && chown -R $USERNAME:$USERNAME $WORKSPACE_FOLDER/frontend/node_modules


RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
    && mkdir /commandhistory \
    && touch /commandhistory/.bash_history \
    && chown -R $USERNAME /commandhistory \
    && echo "$SNIPPET" >> "/home/$USERNAME/.bashrc"

RUN apt-get update && \
    apt-get -y install --no-install-recommends \
    build-essential \
    dnsutils \
    inetutils-traceroute \
    apt-transport-https \
    ca-certificates \
    gnupg \
    curl 

RUN apt-get clean -y && rm -rf /var/lib/apt/lists/*

CMD ["sleep", "infinity"]