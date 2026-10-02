#!/usr/bin/env python3

import csv
import sys


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} INPUT_TSV OUTPUT_CSV", file=sys.stderr)
        sys.exit(1)

    input_file, output_file = sys.argv[1:]

    with open(input_file, "r", encoding="utf-8", newline="") as infile, \
         open(output_file, "w", encoding="utf-8", newline="") as outfile:

        reader = csv.reader(infile, delimiter="\t")
        writer = csv.writer(outfile, lineterminator="\n")

        for row in reader:
            if len(row) != 4:
                print(f"Warning: skipping malformed row: {row}", file=sys.stderr)
                continue

            ability_number, ability_name, description, cost = row

            if "passive" not in description.lower():
                writer.writerow([ability_number, ability_name])


if __name__ == "__main__":
    main()