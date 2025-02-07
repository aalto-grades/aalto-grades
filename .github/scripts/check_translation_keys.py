import json
import os

"""
This script checks that all translation.json files in the 'locales' directory
(en, fi, sv) have the same set of keys to ensure consistency across languages.

English file is set as reference where all other translations are compared to.
"""

def get_keys_from_dict(data, parent_key=""):
    """Recursively extract all nested keys from a dictionary."""
    keys = set()
    for key, value in data.items():
        full_key = f"{parent_key}.{key}" if parent_key else key
        keys.add(full_key)
        if isinstance(value, dict):
            keys.update(get_keys_from_dict(value, full_key))
    return keys

def get_keys_from_file(filename):
    """Load JSON file and return a set of its keys, including nested ones."""
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return get_keys_from_dict(data)

def main():
    # Get the absolute path of the project's root directory
    ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

    # Correct path to locales
    path = os.path.join(ROOT_DIR, "client/public/locales")

    languages = ['en', 'fi', 'sv']
    files = [os.path.join(path, lang, 'translation.json') for lang in languages]

    # Check if all expected files exist
    missing_files = [file for file in files if not os.path.exists(file)]
    if missing_files:
        print(f"Error: Missing translation files: {missing_files}")
        exit(1)

    all_keys = []

    # Get keys from each file
    for file in files:
        all_keys.append((file, get_keys_from_file(file)))

    # Explicitly set English as the reference
    base_file, base_keys = next((file, keys) for file, keys in all_keys if 'en/translation.json' in file)

    for file, keys in all_keys:
        if file == base_file:
            continue
        if keys != base_keys:
            diff = keys.symmetric_difference(base_keys)
            print(f"Keys mismatch between {base_file} and {file}. Difference: {diff}")
            exit(1)

    print("All translation files have consistent keys!")

if __name__ == "__main__":
    main()
