from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Optional, Annotated
from bson import ObjectId

PyObjectId = Annotated[str, BeforeValidator(str)]

class State(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    code: str
    type: str # State or Union Territory

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )
