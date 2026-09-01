#!/usr/bin/env python3
"""Check recipes/index.json against the recipe files it points at.

Run it with no arguments from the repository root. It prints one line per
problem and exits non-zero if it found any.
"""

import glob
import json
import os
import sys
from collections import OrderedDict

INDEX = "recipes/index.json"
ENTRY_KEYS = ["id", "file", "title", "time", "serves", "tried", "keywords"]
RECIPE_KEYS = ["id", "title", "time", "serves", "tried", "ingredients", "tools",
               "steps", "troubleshooting"]
SHARED_KEYS = ["id", "title", "time", "serves", "tried"]
SECTIONS = ["supermarket", "general", "optional"]

problems = []


def problem(message):
    problems.append(message)


def load(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle, object_pairs_hook=OrderedDict)


def out_of_order(keys, canonical):
    present = list(keys)
    return present != [key for key in canonical if key in present]


def check_entry(entry):
    where = entry.get("id", "<no id>")

    if out_of_order(entry, ENTRY_KEYS):
        problem(f"{where}: index keys are out of order: {list(entry)}")

    path = entry.get("file")
    if not path or not os.path.exists(path):
        problem(f"{where}: index points at a missing file: {path}")
        return

    if entry["id"] != os.path.basename(path)[: -len(".json")]:
        problem(f"{where}: id does not match the filename {path}")

    recipe = load(path)

    for key in SHARED_KEYS:
        if recipe.get(key) != entry.get(key):
            problem(f"{where}: {key} is {recipe.get(key)!r} in {path} "
                    f"but {entry.get(key)!r} in the index")

    if out_of_order(recipe, RECIPE_KEYS):
        problem(f"{where}: recipe keys are out of order: {list(recipe)}")

    for holder, label in ((recipe, path), (entry, "the index")):
        if "tried" in holder and holder["tried"] is not True:
            problem(f"{where}: tried is {holder['tried']!r} in {label}, "
                    "write it only as true or leave it out")

    sections = list(recipe.get("ingredients", {}))
    if out_of_order(sections, SECTIONS):
        problem(f"{where}: ingredient sections are out of order: {sections}")
    for name, items in recipe.get("ingredients", {}).items():
        if name not in SECTIONS:
            problem(f"{where}: unknown ingredient section {name!r}")
        if not items:
            problem(f"{where}: ingredient section {name!r} is empty, omit it instead")

    assets = [item["icon"] for items in recipe.get("ingredients", {}).values()
              for item in items]
    assets += [tool["icon"] for tool in recipe.get("tools", [])]
    assets += [step["image"] for step in recipe.get("steps", [])]
    for asset in assets:
        if not os.path.exists(asset):
            problem(f"{where}: missing asset {asset}")

    for number, step in enumerate(recipe.get("steps", []), 1):
        expected = f"img/{entry['id']}-{number}.svg"
        if step.get("image") != expected:
            problem(f"{where}: step {number} image should be {expected}, "
                    f"got {step.get('image')}")


def main():
    if not os.path.exists(INDEX):
        print(f"{INDEX} not found, run this from the repository root")
        return 1

    entries = load(INDEX)["recipes"]

    listed = {entry["file"] for entry in entries if "file" in entry}
    on_disk = {path for path in glob.glob("recipes/*.json") if path != INDEX}
    for path in sorted(on_disk - listed):
        problem(f"{path} is not listed in {INDEX}")

    seen = set()
    for entry in entries:
        if entry.get("id") in seen:
            problem(f"{entry.get('id')}: listed twice in {INDEX}")
        seen.add(entry.get("id"))
        check_entry(entry)

    for line in problems:
        print(line)

    if problems:
        print(f"\n{len(problems)} problem(s) found in {len(entries)} recipes")
        return 1

    print(f"{len(entries)} recipes, index and files agree")
    return 0


if __name__ == "__main__":
    sys.exit(main())
