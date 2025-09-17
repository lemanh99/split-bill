import uvicorn

import config

if __name__ == "__main__":
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=config.API_PORT,
        timeout_keep_alive=config.API_TIMEOUT_ALIVE,
        workers=config.WORKER_NUM,
        reload=True,
    )
