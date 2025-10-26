import csv
import json

def parse_csv_to_json(csv_file_path):
    # Read the CSV file
    with open(csv_file_path, 'r') as csvfile:
        reader = csv.reader(csvfile)
        
        # Extract metadata
        metadata_row = next(reader)
        link = metadata_row[1]  # Second column contains the link
        
        # Skip empty rows until we find the team names
        team_names = {}
        while True:
            row = next(reader)
            if row[1] == "Team Name":  # Header row for teams
                break
        
        # Read team names
        while True:
            row = next(reader)
            if (row[0] == "" and row[1] == "") or row[0] == "Weeks":  # End of team names section
                break
            if row[1] != "Team Name":  # Skip header row
                team_names[row[1]] = row[2]  # Team name -> Coach name mapping
        
        # Skip empty rows until we find the weeks section
        while True:
            if row[0] == "Weeks":
                break
            row = next(reader)

        # Parse weeks data
        weeks = []

        # Skip the header row for weeks
        while True:
            if len(row) > 1 and row[1] != "W.":
                break
            row = next(reader)

        for row in reader:
            if row[0] == "Playoffs":  # End of regular weeks
                break
                
            week, winner, won, diff, loser = row[1], row[4], row[5] == 'W', row[6], row[10]
            if not week:  # Empty week index indicates end of data
                break   
            week = int(week)
            
            if not won:
                winner, loser = loser, winner
            
            while week > len(weeks):
                weeks.append([])
            
            weeks[week - 1].append({
                "w": winner,
                "l": loser,
                "diff": diff
            })

        
        # Parse playoffs data
        playoffs = []
        
        # Skip to playoffs data
        while True:
            row = next(reader)
            if row[0] == "Playoffs":
                break

        playoff_rows = [row for row in reader]

        playoff_round = 0
        col_idx = -3
        while col_idx + 6 < len(playoff_rows[0]):
            col_idx += 6
            playoff_round += 1

            team_col = col_idx
            diff_col = col_idx + 1

            row_idx = 0
            while row_idx < len(playoff_rows):
                while row_idx < len(playoff_rows) and playoff_rows[row_idx][team_col] == "":
                    row_idx += 1
                if row_idx >= len(playoff_rows):
                    break
    
                winner = playoff_rows[row_idx][team_col]
                diff = int(playoff_rows[row_idx][diff_col])
                lost = diff == 0

                row_idx += 1
                while row_idx < len(playoff_rows) and playoff_rows[row_idx][team_col] == "":
                    row_idx += 1
                if row_idx >= len(playoff_rows):
                    break

                loser = playoff_rows[row_idx][team_col]
                diff = max(diff, int(playoff_rows[row_idx][diff_col]))
                if lost:
                    winner, loser = loser, winner

                while playoff_round > len(playoffs):
                    playoffs.append([])
                
                playoffs[playoff_round - 1].append({
                    "w": winner,
                    "l": loser,
                    "diff": diff
                })
                row_idx += 1
        
        # Create the final JSON structure
        result = {
            "metadata": {
                "link": link,
                "team_names": team_names
            },
            "weeks": weeks
        }
        
        # Add playoffs if they exist
        if playoffs:
            result["playoffs"] = playoffs
            
        return result

for i in range(4, 7):
    # Parse the CSV file
    csv_file_path = f'./csv/s{i}.csv'
    data = parse_csv_to_json(csv_file_path)

    # Write to JSON file
    with open(f'../data/s{i}.json', 'w') as jsonfile:
        json.dump(data, jsonfile, indent=2)

    print(f"CSV parsed and saved to data/s{i}.json")
