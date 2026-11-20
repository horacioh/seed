# Build context: devin-bridge/
FROM oven/bun:1.3.10

# ca-certificates: the Devin installer and CLI verify TLS against the system CA store.
# curl: used by the Devin installer and the healthcheck fallback.
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Non-root user for the CLI and server.
RUN useradd --create-home --shell /bin/bash devin
USER devin
ENV HOME=/home/devin

# Build metadata (passed by CI). Stamped as env vars for runtime introspection.
ARG VERSION=dev
ARG COMMIT_HASH=unknown
ARG BRANCH=unknown
ARG DATE=unknown

# Install the Devin CLI. DEVIN_VERSION (optional) pins to a specific release by
# fetching its versioned setup script (e.g. "3000.12.57"). The installer places
# the binary under ~/.local/share/devin/cli/_versions/<v>/bin/devin and symlinks
# ~/.local/bin/devin to it; credentials live at ~/.local/share/devin/credentials.toml.
# The installer ends by running the interactive `devin setup` (first-run login), which
# cannot work in a build, so that line is removed; signing in happens later in the
# running container. The grep fails the build if the installer stops ending that way.
ARG DEVIN_VERSION=""
RUN set -e; \
    if [ -n "$DEVIN_VERSION" ]; then url="https://cli.devin.ai/cli/${DEVIN_VERSION}/setup.sh"; \
    else url="https://cli.devin.ai/install.sh"; fi; \
    curl -fsSL "$url" -o /tmp/devin-install.sh; \
    grep -q '" setup$' /tmp/devin-install.sh; \
    sed -i '/" setup$/d' /tmp/devin-install.sh; \
    bash /tmp/devin-install.sh </dev/null; \
    rm /tmp/devin-install.sh

# Relocate the resolved binary to /usr/local/bin so a volume mounted on
# ~/.local/share/devin (to persist credentials) does not shadow the binary.
USER root
RUN cp "$(readlink -f /home/devin/.local/bin/devin)" /usr/local/bin/devin && chmod 0755 /usr/local/bin/devin
USER devin

# Bridge configuration for the Devin CLI: deny every tool (the bridge uses Devin
# purely as a language model; its own tools must never run) and disable
# background auto-update so the pinned binary is not swapped out from under the
# running container.
COPY --chown=devin:devin devin-config.json /home/devin/.config/devin/config.json

WORKDIR /home/devin/bridge
COPY --chown=devin:devin package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY --chown=devin:devin tsconfig.json ./
COPY --chown=devin:devin src ./src

# Persist the Devin login across container recreation. The volume shadows the
# installed versions directory, but the runtime binary at /usr/local/bin/devin
# is in the image and unaffected.
VOLUME /home/devin/.local/share/devin

EXPOSE 8787
ENV DEVIN_BRIDGE_HOSTNAME=0.0.0.0
ENV DEVIN_BRIDGE_PORT=8787
ENV DEVIN_BRIDGE_VERSION=${VERSION} \
    DEVIN_BRIDGE_COMMIT=${COMMIT_HASH} \
    DEVIN_BRIDGE_BRANCH=${BRANCH} \
    DEVIN_BRIDGE_DATE=${DATE}

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["bun", "-e", "fetch('http://127.0.0.1:8787/health', {signal: AbortSignal.timeout(4000)}).then((res) => process.exit(res.ok ? 0 : 1), () => process.exit(1))"]

CMD ["bun", "src/main.ts"]
