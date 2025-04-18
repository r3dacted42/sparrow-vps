import os
import subprocess
from fastapi import APIRouter, status, Response
from dotenv import load_dotenv
from time import time

load_dotenv()
CLONE_BASE_DIR = os.getenv("CLONE_BASE_DIR")
basedir = os.path.join(*(CLONE_BASE_DIR if CLONE_BASE_DIR else "./cloned_repos").split('/'))

router = APIRouter(
    prefix="/clone",
    tags=["clone"],
    responses={ 
        404: {"description": "not found"},
        500: {"message": "internal server error"}
    },
)

@router.post("/{owner}/{repo}", status_code=status.HTTP_200_OK)
async def clone_repo(owner: str, repo: str, reponse: Response):
    repo_url = f"https://github.com/{owner}/{repo}.git"
    clone_dir = os.path.join(basedir, owner, repo)
    os.makedirs(os.path.dirname(clone_dir), exist_ok=True)
    clone_cmd = [
        "git",
        "clone",
        "--depth=1",
        repo_url,
        clone_dir,
    ]
    res = subprocess.run(clone_cmd, check=True, capture_output=True)
    return {
        "message": "ok",
        "return_code": res.returncode,
        "stdout": res.stdout,
        "stderr": res.stderr,
    }
