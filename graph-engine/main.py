from fastapi import FastAPI

from api.routes import router


app = FastAPI(
    title="CRIMESCOPE AI",
    description="Graph + Criminal Network Intelligence Engine",
    version="1.0.0",
)


app.include_router(router)


@app.get("/")
def root():
    return {
        "system": "CRIMESCOPE AI",
        "module": "Graph + Criminal Network Intelligence Engine",
        "status": "running",
    }