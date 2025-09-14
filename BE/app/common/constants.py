from enum import Enum


class SocialProvider(str, Enum):
    GOOGLE = "google"

class BillType(int, Enum):
    SIMPLE = 1
    RESTAURANT = 2