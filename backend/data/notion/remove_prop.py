#!/usr/bin/env python3
"""
JSON Property Remover Script
Removes specified properties from a JSON file.
Configure the variables below and run the script.
"""

import json
import os
from typing import List, Dict, Any

# =============================================================================
# CONFIGURATION - EDIT THESE VARIABLES
# =============================================================================

# Name of the JSON file to process (in the same directory)
JSON_FILENAME = "2021.json"

# List of property names to remove
PROPERTIES_TO_REMOVE = [
    "Name",
    "اليوم", 
    "Growth",
    "Religion",
    "Thekr",
    "prays",
    "العادات",
    "تعديل التاريخ",
    "مستوي الإنتاجية",
    "الإنجازات",
    "تعلمت",
    "Habits",
    "آية اليوم",
    "أهداف الغد",
        "الخواطر",
        "أمور تعلمتها",
         "college",
          "Tags",
           "الحالة المزاجية",
            "الصورة",
            "الربع السنوي",
]

# =============================================================================
# SCRIPT CODE - DO NOT MODIFY BELOW THIS LINE
# =============================================================================


def remove_properties_recursive(data: Any, properties_to_remove: List[str]) -> Any:
    """
    Recursively remove specified properties from a data structure.
    
    Args:
        data: The data structure (dict, list, or primitive)
        properties_to_remove: List of property names to remove
    
    Returns:
        The data structure with specified properties removed
    """
    if isinstance(data, dict):
        # Create a new dict without the specified properties
        result = {}
        for key, value in data.items():
            if key not in properties_to_remove:
                result[key] = remove_properties_recursive(value, properties_to_remove)
        return result
    elif isinstance(data, list):
        # Process each item in the list
        return [remove_properties_recursive(item, properties_to_remove) for item in data]
    else:
        # Return primitive values as-is
        return data


def remove_properties_from_json(filename: str, properties: List[str]) -> None:
    """
    Remove specified properties from a JSON file.
    
    Args:
        filename: Name of the JSON file
        properties: List of property names to remove
    """
    # Check if file exists
    if not os.path.exists(filename):
        print(f"Error: File '{filename}' not found in current directory.")
        return
    
    try:
        # Read the JSON file
        with open(filename, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        print(f"Successfully loaded '{filename}'")
        print(f"Properties to remove: {properties}")
        
        # Remove specified properties
        cleaned_data = remove_properties_recursive(data, properties)
        
        # Write back to the same file
        with open(filename, 'w', encoding='utf-8') as file:
            json.dump(cleaned_data, file, indent=2, ensure_ascii=False)
        
        print(f"Successfully removed properties and updated '{filename}'")
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in '{filename}': {e}")
    except Exception as e:
        print(f"Error processing file: {e}")


def main():
    """Main function that uses the configured variables."""
    
    if not JSON_FILENAME:
        print("Error: JSON_FILENAME is not configured.")
        return
    
    if not PROPERTIES_TO_REMOVE:
        print("Error: PROPERTIES_TO_REMOVE list is empty.")
        return
    
    print("=== JSON Property Remover ===")
    print(f"Target file: {JSON_FILENAME}")
    print(f"Properties to remove: {', '.join(PROPERTIES_TO_REMOVE)}")
    print()
    
    remove_properties_from_json(JSON_FILENAME, PROPERTIES_TO_REMOVE)


if __name__ == "__main__":
    main()