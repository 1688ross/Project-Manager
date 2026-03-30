import csv, re, json

with open('scripts/shc-gantt.csv', 'r') as f:
    rows = list(csv.reader(f))

print(f"Total rows: {len(rows)}")
print(f"Cols per row: {len(rows[0])}")

# Row 0: month headers
month_row = rows[0]
print("\nMonth markers in row 0:")
for i, c in enumerate(month_row):
    if c.strip():
        print(f"  col[{i}] = '{c.strip()}'")

# Row 1: date labels
date_row = rows[1]
print("\nDate labels in row 1 (non-empty):")
for i, c in enumerate(date_row):
    if c.strip():
        print(f"  col[{i}] = '{c.strip()}'")

# Build month boundaries from row 0
month_boundaries = []
for i, c in enumerate(month_row):
    s = c.strip().upper()
    if s in ('FEB', 'FEBRUARY'):
        month_boundaries.append((i, 2))
    elif s in ('MAR', 'MARCH'):
        month_boundaries.append((i, 3))
    elif s in ('APR', 'APRIL'):
        month_boundaries.append((i, 4))
    elif s in ('MAY',):
        month_boundaries.append((i, 5))
    elif s in ('JUN', 'JUNE'):
        month_boundaries.append((i, 6))

print(f"\nMonth boundaries: {month_boundaries}")

# Build col -> date mapping from row 1
date_map = {}
current_month = None

for i, c in enumerate(date_row):
    s = c.strip()
    if not s:
        continue
    
    # Check if this is a month label in the date row
    upper = s.upper()
    if upper in ('FEBRUARY', 'FEB'):
        current_month = 2
        continue
    elif upper in ('MARCH', 'MAR'):
        current_month = 3
        continue
    elif upper in ('APRIL', 'APR'):
        current_month = 4
        continue
    elif upper in ('MAY',):
        current_month = 5
        continue
    elif upper in ('JUNE', 'JUN'):
        current_month = 6
        continue
    
    # If no current_month yet, determine from month_boundaries
    if current_month is None:
        for col, month in sorted(month_boundaries):
            if i >= col:
                current_month = month
    
    # Also check month_boundaries to update current_month
    for col, month in sorted(month_boundaries):
        if i >= col and month > (current_month or 0):
            current_month = month
    
    # Extract day number from labels like "Mon2", "Tue3", "Wed4", "Thu5", "Fri6"
    m = re.search(r'(\d+)$', s)
    if m and current_month:
        day = int(m.group(1))
        date_map[i] = f"2025-{current_month:02d}-{day:02d}"

print(f"\nTotal date columns mapped: {len(date_map)}")
items = sorted(date_map.items())
for col, d in items[:30]:
    print(f"  col[{col}] = {d}")
print("  ...")
for col, d in items[-10:]:
    print(f"  col[{col}] = {d}")

# Parse data rows
print("\nData rows (2+):")
for r in range(2, min(len(rows), 25)):
    row = rows[r]
    col0 = row[0].strip() if row[0].strip() else ""
    col1 = row[1].strip() if len(row) > 1 and row[1].strip() else ""
    symbols = []
    for i in range(2, len(row)):
        cell = row[i].strip()
        if cell in ('>', '<', 'X', 'x'):
            symbols.append((i, cell))
    print(f"  Row {r}: col0='{col0}' col1='{col1}' symbols={symbols}")

# Build tasks
tasks = []
current_prop = ''
for r in range(2, len(rows)):
    row = rows[r]
    col0 = row[0].strip() if row[0].strip() else ''
    col1 = row[1].strip() if len(row) > 1 and row[1].strip() else ''
    
    if col0:
        current_prop = col0
    
    if col1 not in ('Brochure', 'Site', 'Wireframe'):
        continue
    
    events = []
    for i in range(2, len(row)):
        cell = row[i].strip()
        if cell in ('>', '<', 'X', 'x') and i in date_map:
            event_type = 'SUBMITTED' if cell == '>' else ('FEEDBACK' if cell == '<' else 'APPROVED')
            events.append({
                'col': i,
                'date': date_map[i],
                'symbol': cell,
                'type': event_type
            })
    
    if events:
        start_date = events[0]['date']
        end_date = events[-1]['date']
        tasks.append({
            'property': current_prop,
            'deliverable': col1,
            'startDate': start_date,
            'endDate': end_date,
            'events': events
        })
        print(f"\n{current_prop} - {col1}: {start_date} to {end_date}")
        for e in events:
            print(f"  {e['date']} {e['symbol']} ({e['type']})")

# Save parsed data
with open('scripts/shc-gantt-parsed.json', 'w') as f:
    json.dump({'tasks': tasks}, f, indent=2)

print(f"\nWrote {len(tasks)} tasks to scripts/shc-gantt-parsed.json")
