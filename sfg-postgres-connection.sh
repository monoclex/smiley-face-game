#!/bin/sh
docker run \
	`# using --network host doesnt allow us to sandbox port` \
	`# -p 3000:80` \
	--network host \
	-e 'PGADMIN_DEFAULT_EMAIL=me@admin.com' \
	-e 'PGADMIN_DEFAULT_PASSWORD=password' \
	-e 'PGADMIN_CONFIG_ENHANCED_COOKIE_PROTECTION=True' \
	-e 'PGADMIN_CONFIG_LOGIN_BANNER="Authorised users only!"' \
	-e 'PGADMIN_CONFIG_CONSOLE_LOG_LEVEL=10' \
	--name sfg-pgadmin \
	-d dpage/pgadmin4
