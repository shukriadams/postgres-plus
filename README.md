# postgres-plus

Partial fork of official Postgres docker image https://github.com/docker-library/postgres
Adds automatic backup daemon.

dumps folder needs to be owned by user postgres (id 999) 

    sudo chown 999 -R ./data

backup command to run in container :

    pg_dump mydev | gzip >/tmp/postgresdumps/mydev_$(date +%Y-%m-%d__%H-%M-%S).tar.gz
