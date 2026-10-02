#!/usr/bin/env python3

import re
import sys
import csv


TIMESTAMP_RE = re.compile(
    r'^\[[A-Z][a-z]{2} [A-Z][a-z]{2} '
    r'\d{2} \d{2}:\d{2}:\d{2} \d{4}\]\s*'
)

ABILITY_RE = re.compile(
    r'^Ability #(\d+):\s*(.*)$',
    re.IGNORECASE
)

DESCRIPTION_RE = re.compile(
    r'^Description:\s*(.*)$',
    re.IGNORECASE
)

COST_RE = re.compile(
    r'^Cost per level:\s*(\d+)\s*$',
    re.IGNORECASE
)


def parse_log(filename):
    records = []
    current = None
    description_lines = None

    with open(filename, "r", encoding="utf-8") as f:
        for raw_line in f:
            line = raw_line.rstrip("\r\n")

            # Remove timestamp from the beginning of timestamped entries.
            line = TIMESTAMP_RE.sub("", line, count=1)

            # Ability entry.
            match = ABILITY_RE.match(line)
            if match:
                current = {
                    "number": match.group(1),
                    "name": match.group(2),
                    "description": "",
                    "cost": "",
                }
                description_lines = None
                continue

            # Description entry.
            match = DESCRIPTION_RE.match(line)
            if match and current is not None:
                description_lines = [match.group(1)]
                continue

            # Cost entry completes the record.
            match = COST_RE.match(line)
            if match and current is not None:
                if description_lines is not None:
                    current["description"] = "\n".join(description_lines)

                current["cost"] = match.group(1)
                records.append(current)

                current = None
                description_lines = None
                continue

            # Anything else while collecting a description is a
            # continuation line.
            if description_lines is not None:
                description_lines.append(line)

    return records


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} INPUT_LOG OUTPUT_TSV", file=sys.stderr)
        sys.exit(1)

    input_file, output_file = sys.argv[1:]

    records = parse_log(input_file)

    with open(output_file, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(
            f,
            delimiter="\t",
            lineterminator="\n",
            quoting=csv.QUOTE_MINIMAL,
        )

        for record in records:
            writer.writerow([
                record["number"],
                record["name"],
                record["description"],
                record["cost"],
            ])

    print(f"Wrote {len(records)} records to {output_file}")


if __name__ == "__main__":
    main()