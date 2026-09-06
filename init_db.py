#!/usr/bin/env python
"""
===========================================================================
🏛️ GeM AI Procurement Compliance & Intelligence Platform
Smart India Hackathon 2026 (Problem Statement ID: SIH26100) - Team Codetox
Database Setup & Management Script
===========================================================================
Usage:
    python init_db.py          # Initialize tables and seed initial records
    python init_db.py --reset  # Drop all tables and recreate fresh database
    python init_db.py --stats  # Display current record counts across all tables
===========================================================================
"""

import sys
import os
import argparse

# Configure UTF-8 stdout on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend module can be imported
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.database import init_db, reset_db, get_db_stats, DB_PATH

def main():
    parser = argparse.ArgumentParser(
        description="GeM AI Procurement Compliance Platform - Database Initializer & Manager"
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Wipe the database and re-initialize all tables and initial seed data."
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Only display record counts for all tables without modifying data."
    )

    args = parser.parse_args()

    print("=======================================================================")
    print("🏛️  GeM AI PROCUREMENT COMPLIANCE PLATFORM (SIH26100)")
    print("    Team Codetox — Database Initialization & Management")
    print(f"[*] Database Path: {os.path.abspath(DB_PATH)}")
    print("=======================================================================")

    if args.reset:
        print("[*] Performing database wipe and re-initialization...")
        reset_db()
        print("[✓] Database reset and re-seeded successfully.")
    elif not args.stats:
        print("[*] Initializing SQLite database schema and seed data...")
        init_db()
        print("[✓] Database initialized and verified.")

    # Show statistics
    stats = get_db_stats()
    print("\n📊 Current Database Statistics:")
    print("┌───────────────────────────┬──────────────┐")
    print("│ Table Name                │ Record Count │")
    print("├───────────────────────────┼──────────────┤")
    for tbl, count in stats.items():
        print(f"│ {tbl.ljust(25)} │ {str(count).rjust(12)} │")
    print("└───────────────────────────┴──────────────┘")
    print("\n[✓] Database is ready for FastAPI backend and Vite frontend operations.")
    print("    Start backend with:  python run_backend.py")
    print("    Start frontend with: npm run dev\n")

if __name__ == "__main__":
    main()
