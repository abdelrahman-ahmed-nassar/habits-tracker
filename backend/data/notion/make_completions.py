import json
import uuid
from datetime import datetime

def load_habits_from_file(habits_file_path):
    """Load habits data from habits.json file"""
    try:
        with open(habits_file_path, 'r', encoding='utf-8') as file:
            habits_data = json.load(file)
        
        # Create a mapping of habit name to habit ID
        habit_name_to_id = {}
        for habit in habits_data:
            habit_name_to_id[habit['name']] = habit['id']
        
        return habit_name_to_id
    except FileNotFoundError:
        print(f"Error: Could not find {habits_file_path}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {habits_file_path}")
        return None

def load_completions_from_file(completions_file_path):
    """Load completions data from completions.json file"""
    try:
        with open(completions_file_path, 'r', encoding='utf-8') as file:
            completions_data = json.load(file)
        return completions_data
    except FileNotFoundError:
        print(f"Error: Could not find {completions_file_path}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {completions_file_path}")
        return None

def parse_date(date_string):
    """Parse date string using configured format to ISO format"""
    try:
        # Parse the date string using configured format
        date_obj = datetime.strptime(date_string, CONFIG["date_format"])
        return date_obj.strftime("%Y-%m-%d")
    except ValueError:
        print(f"Warning: Could not parse date {date_string} with format {CONFIG['date_format']}")
        return date_string

def convert_completions(habits_file_path, completions_file_path, output_file_path):
    """Convert completions.json to proper completion objects format"""
    
    # Load habits mapping
    habit_name_to_id = load_habits_from_file(habits_file_path)
    if habit_name_to_id is None:
        return False
    
    # Load completions data
    completions_data = load_completions_from_file(completions_file_path)
    if completions_data is None:
        return False
    
    converted_completions = []
    warnings = []
    stats = {
        'total_records': 0,
        'total_completions': 0,
        'matched_habits': 0,
        'unmatched_habits': 0
    }
    
    # Process each completion record
    for record in completions_data:
        stats['total_records'] += 1
        
        # Get the date from the record
        date_string = record.get('التاريخ', '')
        if not date_string:
            warnings.append(f"Record missing date: {record}")
            continue
        
        # Parse the date
        parsed_date = parse_date(date_string)
        
        # Create completion timestamp (assuming end of day)
        completion_timestamp = f"{parsed_date}T23:59:59.000{CONFIG['output_timezone']}"
        
        # Process each habit in the record
        for habit_name, completion_value in record.items():
            if habit_name == 'التاريخ':  # Skip the date field
                continue
            
            # Check if habit exists in our habits mapping
            if habit_name not in habit_name_to_id:
                warnings.append(f"Habit '{habit_name}' not found in habits.json")
                stats['unmatched_habits'] += 1
                continue
            
            stats['matched_habits'] += 1
            
            # Determine if the habit was completed
            completed = completion_value.lower() == 'yes'
            if completed:
                stats['total_completions'] += 1
            
            # Create completion object
            completion_obj = {
                "id": str(uuid.uuid4()),
                "habitId": habit_name_to_id[habit_name],
                "date": parsed_date,
                "completed": completed,
                "value": 1 if completed else 0,
                "completedAt": completion_timestamp if completed else None
            }
            
            converted_completions.append(completion_obj)
    
    # Save converted completions to output file
    try:
        with open(output_file_path, 'w', encoding='utf-8') as file:
            json.dump(converted_completions, file, indent=2, ensure_ascii=False)
        
        print("✅ Conversion completed successfully!")
        print(f"📁 Output saved to: {output_file_path}")
        print(f"📊 Total records processed: {stats['total_records']}")
        print(f"📊 Total completions created: {len(converted_completions)}")
        print(f"✅ Completed habits: {stats['total_completions']}")
        print(f"✅ Matched habits: {stats['matched_habits']}")
        print(f"⚠️  Unmatched habits: {stats['unmatched_habits']}")
        
        if warnings:
            print(f"\n⚠️  Warnings ({len(warnings)}):")
            for warning in warnings[:10]:  # Show first 10 warnings
                print(f"   - {warning}")
            if len(warnings) > 10:
                print(f"   ... and {len(warnings) - 10} more warnings")
        
        return True
        
    except Exception as e:
        print(f"Error saving output file: {e}")
        return False

# Configuration - Modify these paths as needed
CONFIG = {
    "habits_file_path": "habits.json",
    "completions_file_path": "2021.json", 
    "output_file_path": "converted_completions.json",
    "date_format": "%Y/%m/%d",  # Format of dates in your completions file
    "output_timezone": "Z"  # Timezone suffix for output timestamps
}

def main():
    """Main function to run the conversion"""
    print("🔄 Starting completion conversion process...")
    
    # Use configuration
    habits_file = CONFIG["habits_file_path"]
    completions_file = CONFIG["completions_file_path"]
    output_file = CONFIG["output_file_path"]
    
    print(f"📂 Reading habits from: {habits_file}")
    print(f"📂 Reading completions from: {completions_file}")
    print(f"📂 Output will be saved to: {output_file}")
    
    success = convert_completions(habits_file, completions_file, output_file)
    
    if success:
        print("\n🎉 Conversion process completed successfully!")
    else:
        print("\n❌ Conversion process failed. Please check the error messages above.")

if __name__ == "__main__":
    main()