from fastapi import APIRouter, status, Response
from github import Github

router = APIRouter(
    prefix="/probe",
    tags=["probe"],
    responses={ 
        404: {"description": "not found"},
        500: {"message": "internal server error"}
    },
)

@router.get("/{owner}/{repo}", status_code=status.HTTP_200_OK)
async def probe_repo(owner: str, repo: str, response: Response):
    g = Github()
    try:
        r = g.get_repo(f"{owner}/{repo}")
        languages = r.get_languages()
        return {
            "message": "ok",
            "language": next(iter(languages)),
        }
    except:
        response.status_code = 404
        return {
            "message": "Repo does not exist or is not public",
        }
