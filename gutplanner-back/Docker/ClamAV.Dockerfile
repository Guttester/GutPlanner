FROM clamav/clamav:1.4_base

COPY Docker/clamd.conf /etc/clamav/clamd.conf
COPY Docker/freshclam.conf /etc/clamav/freshclam.conf
USER clamav
ENTRYPOINT ["/init-unprivileged"]
