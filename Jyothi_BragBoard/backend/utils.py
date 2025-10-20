from datetime import datetime, timedelta

def utc_to_ist(utc_dt: datetime) -> str:
    """Convert UTC datetime to IST string in 12-hour format."""
    ist_dt = utc_dt + timedelta(hours=5, minutes=30)
    return ist_dt.strftime("%b %d, %Y %I:%M %p")  # e.g., Oct 14, 2025 09:30 PM
