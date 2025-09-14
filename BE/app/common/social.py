from authlib.integrations.starlette_client import OAuth

from config import starlette_config, JWT_ACCESS_SECRET_KEY

social_oauth = OAuth(starlette_config)
GOOGLE_AUTH_CONF_URL = "https://accounts.google.com/.well-known/openid-configuration"
social_oauth.register(
    name="google",
    server_metadata_url=GOOGLE_AUTH_CONF_URL,
    client_kwargs={"scope": "openid email profile"},
    authorize_state=JWT_ACCESS_SECRET_KEY
)
