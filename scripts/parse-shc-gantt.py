import csv
import json

with open('scripts/shc-gantt.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)

print(f'Rows: {len(rows)}')
print(f'Row 0 cols: {len(rows[0])}')
print(f'Row 2 cols: {len(rows[2])}')

# Print row 2 date columns with index
print('\nDate columns:')
for i, cell in enumerate(rows[2]):
    if cell.strip():
        print(f'  [{i}] = "{cell.strip()}"')
    if i > 100:
        print('  ... (truncated)')
        break

# Print row 0 month headers
print('\nMonth headers:')
for i, cell in enumerate(rows[0]):
    if cell.strip():
        print(f'  [{i}] = "{cell.strip()}"')

# Print data rows (task rows)
print('\nData rows:')
for r in range(3, len(rows)):
    row = rows[r]
    prop = row[0].strip() if len(row) > 0 else ''
    deliv = row[1].strip() if len(row) > 1 else ''
    if prop or deliv:
        symbols = []
        for i in range(2, len(row)):
            cell = row[i].strip()
            if cell in ('>', '<', 'X'):
                symbols.append((i, cell))
        print(f'  Row {r}: property="{prop}" deliverable="{deliv}" events={symbols}')

# Build full date map
print('\nBuilding date map...')
date_cols = {}
current_month = 2  # Feb = 2 in calendar
month_names = {'MARCH': 3, 'April': 4, 'May': 5, 'June': 6, 'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12}

# First pass: detect month markers in row 0
month_markers = {}
for i, cell in enumerate(rows[0]):
    s = cell.strip()
    if s in ('Feb',):
        month_markers[i] = 2
    for mn, mv in month_names.items():
        if s == mn:
            month_markers[i] = mv

print(f'Month markers from row 0: {month_markers}')

# Also check row 2 for "MARCH" marker
for i, cell in enumerate(rows[2]):
    s = cell.strip()
    if s == 'MARCH':
        month_markers[i] = 3

# Second pass: assign dates based on day labels in row 2
import re
prev_day = 0
current_month = 2  # Start with Feb

for i, cell in enumerate(rows[2]):
    s = cell.strip()
    
    # Check for month marker on this column
    if i in month_markers:
        current_month = month_markers[i]
        continue
    
    m = re.search(r'(\d+)$', s)
    if m:
        day = int(m.group(1))
        # Detect month rollover (day goes from high to low)
        if day < prev_day and day <= 5:
            current_month += 1
        date_cols[i] = f'2026-{current_month:02d}-{day:02d}'
        prev_day = day

print(f'\nTotal date columns: {len(date_cols)}')
# Print first 30 and last 10
items = sorted(date_cols.items())
for idx, (col, date) in enumerate(items):
    if idx < 30 or idx >= len(items) - 10:
        print(f'  col[{col}] = {date}')
    elif idx == 30:
        print(f'  ... ({len(items) - 40} more) ...')

# Output JSON for the seed script
output = {'dates': date_cols, 'tasks': []}
current_prop = ''
for r in range(3, len(rows)):
    row = rows[r]
    prop = row[0].strip() if len(row) > 0 else ''
    deliv = row[1].strip() if len(row) > 1 else ''
    if prop:
        current_prop = prop
    if not deliv or deliv == 'KEY':
        continue
    if deliv not in ('Brochure', 'Site', 'Wireframe'):
        continue
    events = []
    for i in range(2, len(row)):
        cell = row[i].strip()
        if cell in ('>', '<', 'X') and i in date_cols:
            events.append({'col': i, 'date': date_cols[i], 'type': cell})
    if events:
        output['tasks'].append({
            'property': current_prop,
            'deliverable': deliv,
            'events': events
        })

with open('scripts/shc-gantt-parsed.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f'\nWrote {len(output["tasks"])} tasks to scripts/shc-gantt-parsed.json')
