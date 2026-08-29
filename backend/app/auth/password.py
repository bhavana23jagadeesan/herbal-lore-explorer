import hashlib

def verify_password(plain_password: str, hashed_password: str) -> bool:
    expected = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return expected == hashed_password

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()
