#!/usr/bin/env python3
"""
Simple script to check reports in database
"""
from database import SessionLocal
from models import Report

def check_reports():
    db = SessionLocal()
    try:
        reports = db.query(Report).all()
        print(f"Total reports in database: {len(reports)}")
        print("\nReport details:")
        for report in reports:
            print(f"ID: {report.id}")
            print(f"Shoutout ID: {report.shoutout_id}")
            print(f"Reporter ID: {report.reporter_id}")
            print(f"Reason: {report.reason}")
            print(f"Status: {report.status}")
            print(f"Created: {report.created_at}")
            if report.resolved_at:
                print(f"Resolved: {report.resolved_at}")
            print("-" * 50)
    finally:
        db.close()

if __name__ == "__main__":
    check_reports()
