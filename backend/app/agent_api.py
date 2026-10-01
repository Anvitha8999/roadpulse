import httpx
from fastapi import APIRouter, HTTPException
from ollama import ResponseError
from pydantic import BaseModel, Field

from .agent import run_agent

router = APIRouter(prefix="/agent", tags=["agent"])


class AgentRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)


class AgentResponse(BaseModel):
    answer: str
    tools_used: list[str]


@router.post("/chat", response_model=AgentResponse)
def chat(body: AgentRequest):
    try:
        answer, tools_used = run_agent(body.question)
    except (ConnectionError, ResponseError, httpx.HTTPError) as exc:
        raise HTTPException(
            status_code=503, detail="The assistant is unavailable. Is Ollama running?"
        ) from exc
    return AgentResponse(answer=answer, tools_used=tools_used)
