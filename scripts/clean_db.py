import sqlite3
import argparse
import sys
import os

# Database path based on Prisma configuration
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'prisma', 'dev.db')

# Bounding box for Cusco and the Sacred Valley
# Approximate coordinates encompassing Cusco, Pisac, Urubamba, Ollantaytambo
MIN_LAT = -13.60
MAX_LAT = -13.10
MIN_LNG = -72.60
MAX_LNG = -71.70

def get_connection():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        sys.exit(1)
    return sqlite3.connect(DB_PATH)

def clean_location(dry_run=False):
    """Deletes businesses outside of the Cusco/Sacred Valley bounding box."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Find businesses outside the bounding box
    query = """
        SELECT id, name, lat, lng FROM Business
        WHERE lat < ? OR lat > ? OR lng < ? OR lng > ?
    """
    cursor.execute(query, (MIN_LAT, MAX_LAT, MIN_LNG, MAX_LNG))
    out_of_bounds = cursor.fetchall()
    
    if not out_of_bounds:
        print("✅ All businesses are within the Cusco/Sacred Valley region.")
        return
        
    print(f"Found {len(out_of_bounds)} businesses outside the Sacred Valley region:")
    for b in out_of_bounds[:5]:
        print(f"  - {b[1]} (Lat: {b[2]}, Lng: {b[3]})")
    if len(out_of_bounds) > 5:
        print(f"  ... and {len(out_of_bounds) - 5} more.")
        
    if dry_run:
        print("Dry run enabled. No records were deleted.")
        return
        
    # Delete reviews first to avoid foreign key constraints (if enforced) or orphaned records
    business_ids = [b[0] for b in out_of_bounds]
    placeholders = ','.join('?' for _ in business_ids)
    
    cursor.execute(f"DELETE FROM Review WHERE businessId IN ({placeholders})", business_ids)
    deleted_reviews = cursor.rowcount
    
    cursor.execute(f"DELETE FROM Business WHERE id IN ({placeholders})", business_ids)
    deleted_businesses = cursor.rowcount
    
    conn.commit()
    conn.close()
    
    print(f"🗑️ Deleted {deleted_businesses} businesses and {deleted_reviews} associated reviews outside the allowed region.")

def clean_reviews(min_reviews, dry_run=False):
    """Deletes businesses with fewer than `min_reviews` reviews."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Find businesses with few reviews
    query = "SELECT id, name, reviewsCount FROM Business WHERE reviewsCount < ?"
    cursor.execute(query, (min_reviews,))
    low_reviews = cursor.fetchall()
    
    if not low_reviews:
        print(f"✅ All businesses have at least {min_reviews} reviews.")
        return
        
    print(f"Found {len(low_reviews)} businesses with fewer than {min_reviews} reviews:")
    for b in low_reviews[:5]:
        print(f"  - {b[1]} ({b[2]} reviews)")
    if len(low_reviews) > 5:
        print(f"  ... and {len(low_reviews) - 5} more.")
        
    if dry_run:
        print("Dry run enabled. No records were deleted.")
        return
        
    business_ids = [b[0] for b in low_reviews]
    placeholders = ','.join('?' for _ in business_ids)
    
    cursor.execute(f"DELETE FROM Review WHERE businessId IN ({placeholders})", business_ids)
    deleted_reviews = cursor.rowcount
    
    cursor.execute(f"DELETE FROM Business WHERE id IN ({placeholders})", business_ids)
    deleted_businesses = cursor.rowcount
    
    conn.commit()
    conn.close()
    
    print(f"🗑️ Deleted {deleted_businesses} businesses and {deleted_reviews} associated reviews due to low review count.")

def main():
    parser = argparse.ArgumentParser(description="InkaPortal Database Cleaning CLI")
    parser.add_argument('--clean-location', action='store_true', help="Delete experiences outside Cusco/Sacred Valley bounds")
    parser.add_argument('--min-reviews', type=int, help="Delete experiences with fewer than MIN_REVIEWS reviews")
    parser.add_argument('--dry-run', action='store_true', help="Preview what would be deleted without actually deleting")
    
    args = parser.parse_args()
    
    if not args.clean_location and args.min_reviews is None:
        parser.print_help()
        print("\n❌ Error: Please specify an action (--clean-location or --min-reviews).")
        sys.exit(1)
        
    print("🏔️ InkaPortal DB Cleaner")
    print("=======================")
    
    if args.clean_location:
        print("\n--- Running Location Cleanup ---")
        clean_location(args.dry_run)
        
    if args.min_reviews is not None:
        print(f"\n--- Running Review Count Cleanup (Min: {args.min_reviews}) ---")
        clean_reviews(args.min_reviews, args.dry_run)

if __name__ == "__main__":
    main()
