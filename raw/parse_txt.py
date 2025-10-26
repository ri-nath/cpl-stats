import json
import re

def s1_and_s2_wks(data):
    weeks_data = []
    week_matches = data.strip().split("Week")  # Split by blank lines for weeks
    
    for week in week_matches:
        week_entries = []
        lines = week.splitlines()

        for line in lines[1:]:  # Skip the "Week X" header
            if not line.strip():
                continue
            
            parts = line.split()
            if 'W' in parts and 'L' in parts:
                # Determine indexes for W and L
                left_index = min(parts.index('W'), parts.index('L'))
                right_index = max(parts.index('W'), parts.index('L'))
                
                # Capture player's name correctly
                left_name = ' '.join(parts[:left_index])
                diff = abs(int(parts[left_index + 1]))  # The score difference comes immediately after 'W'
                right_name = ' '.join(parts[right_index + 1:])  # All parts after 'L'

                winner, loser = left_name, right_name
                if left_index == parts.index('L'):
                    winner, loser = loser, winner

                week_entries.append({
                    "w": winner,
                    "l": loser,
                    "diff": str(diff)
                })

        weeks_data.append(week_entries)

    return json.dumps({"weeks": weeks_data}, indent=4)

def s3_wks(data):
    weeks_data = []

    for line in data.splitlines():
        parts = line.split()
        if not ('W' in parts and 'L' in parts):
            continue
        
        for i in range(0, len(parts), 6):
            left_name = parts[i]
            diff = abs(int(parts[i + 2]))
            right_name = parts[i + 5]

            winner, loser = left_name, right_name
            if parts[i + 1] == 'L':
                winner, loser = loser, winner

            while len(weeks_data) < i // 6 + 1:
                weeks_data.append([])

            weeks_data[i // 6].append({
                "w": winner,
                "l": loser,
                "diff": str(diff)
            })
        #weeks_data.append(week_entries)

    return json.dumps({"weeks": weeks_data}, indent=4)

file_path = 'weeks/s3.txt'
with open(file_path, 'r') as file:
    data = file.read()

# Now call the function with the data
json_output = s3_wks(data)
print(json_output)

