from enum import Enum


class SocialProvider(str, Enum):
    GOOGLE = "google"

class BillType(int, Enum):
    SIMPLE = 1
    RESTAURANT = 2

class BillShareType(int, Enum):
    PRIVATE = 1
    PUBLIC = 2

class BillStatus(int, Enum):
    DRAFT = 1
    FINALIZED = 2
    CANCELLED = 3