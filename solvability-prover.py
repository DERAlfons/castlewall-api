#!/usr/bin/python3

import sys
import json

from z3 import *

def transpose(matrix):
    t = []
    for i in range(len(matrix[0])):
        t += [[]]
        for j in range(len(matrix)):
            t[i] += [matrix[j][i]]
    return t

def int_log(b, n):
    p = 1
    e = 0
    while p <= n:
        p *= b
        e += 1
    return e - 1

puzzle = json.loads(sys.argv[1])

s = Solver()

bit_length = int_log(2, puzzle["height"] * (puzzle["width"] - 1) + puzzle["width"] * (puzzle["height"] - 1)) + 1
vboard = [[BitVec("v_r%d_c%d" % (r, c), bit_length) for r in range(puzzle["height"] - 1)]
          for c in range(puzzle["width"])]
hboard = [[BitVec("h_r%d_c%d" % (r, c), bit_length) for c in range(puzzle["width"] - 1)]
          for r in range(puzzle["height"])]

variable_ref = { }
for row in vboard:
    for v in row:
        variable_ref[v.decl().name()] = v
for row in hboard:
    for v in row:
        variable_ref[v.decl().name()] = v

for i in range(len(hboard)):
    for j in range(len(hboard[0])):
        a0 = hboard[i][j] == 0;

        lefts = []
        if j > 0:
            lefts += [hboard[i][j - 1]]
        if i > 0:
            lefts += [vboard[j][i - 1]]
        if i < len(hboard) - 1:
            lefts += [vboard[j][i]]
        rights = []
        if j < len(hboard[0]) - 1:
            rights += [hboard[i][j + 1]]
        if i > 0:
            rights += [vboard[j + 1][i - 1]]
        if i < len(hboard) - 1:
            rights += [vboard[j + 1][i]]
        n_reqs = [hboard[i][j] >= 3,
                  Or(*[w == hboard[i][j] - 1 for w in lefts + rights]),
                  Or(*[w == hboard[i][j] + 1 for w in lefts + rights])]
        if len(lefts) == 2:
            n_reqs += [Or(*[w == 0 for w in lefts])]
        if len(lefts) == 3:
            n_reqs += [AtLeast(*[w == 0 for w in lefts], 2)]
        if len(rights) == 2:
            n_reqs += [Or(*[w == 0 for w in rights])]
        if len(rights) == 3:
            n_reqs += [AtLeast(*[w == 0 for w in rights], 2)]
        an = And(*n_reqs)

        if i < len(hboard) - 1:
            before = []
            for k in range(i):
                before += hboard[k]
            before += hboard[i][:j]
            if j < len(hboard[0]) - 1:
                nextw = Or(hboard[i][j + 1] == 2, vboard[j + 1][i] == 2)
            else:
                nextw = vboard[j + 1][i] == 2
            a1 = And(hboard[i][j] == 1, nextw, *[w == 0 for w in before])

            if j > 0:
                if j < len(hboard[0]) - 1:
                    nextw = Or(hboard[i][j + 1] == 3, vboard[j + 1][i] == 3)
                else:
                    nextw = vboard[j + 1][i] == 3
                a2 = And(hboard[i][j] == 2, nextw, hboard[i][j - 1] == 1)

                s.add(Or(a0, a1, a2, an))
            else:
                s.add(Or(a0, a1, an))
        else:
            s.add(Or(a0, an))

for i in range(len(vboard)):
    for j in range(len(vboard[0])):
        a0 = vboard[i][j] == 0

        ups = []
        if j > 0:
            ups += [vboard[i][j - 1]]
        if i > 0:
            ups += [hboard[j][i - 1]]
        if i < len(vboard) - 1:
            ups += [hboard[j][i]]
        downs = []
        if j < len(vboard[0]) - 1:
            downs += [vboard[i][j + 1]]
        if i > 0:
            downs += [hboard[j + 1][i - 1]]
        if i < len(vboard) - 1:
            downs += [hboard[j + 1][i]]
        n_reqs = [vboard[i][j] >= 3,
                  Or(*[w == vboard[i][j] - 1 for w in ups + downs])]
        if i < len(vboard) - 1:
            n_reqs += [Or(*[w == vboard[i][j] + 1 for w in ups + downs],
                          hboard[j][i] == 1)]
        else:
            n_reqs += [Or(*[w == vboard[i][j] + 1 for w in ups + downs])]
        if len(ups) == 2:
            n_reqs += [Or(*[w == 0 for w in ups])]
        if len(ups) == 3:
            n_reqs += [AtLeast(*[w == 0 for w in ups], 2)]
        if len(downs) == 2:
            n_reqs += [Or(*[w == 0 for w in downs])]
        if len(downs) == 3:
            n_reqs += [AtLeast(*[w == 0 for w in downs], 2)]
        an = And(*n_reqs)

        if i > 0:
            two_reqs = [vboard[i][j] == 2, hboard[j][i - 1] == 1]
            downs = [hboard[j + 1][i - 1]]
            if j < len(vboard[0]) - 1:
                downs += [vboard[i][j + 1]]
            if i < len(vboard) - 1:
                downs += [hboard[j + 1][i]]
            if len(downs) == 1:
                two_reqs += [downs[0] == 3]
            else:
                two_reqs += [Or(*[w == 3 for w in downs])]
            a2 = And(*two_reqs)

            s.add(Or(a0, a2, an))
        else:
            s.add(Or(a0, an))

for hint in puzzle["hints"]:
    if hint["position"]["j"] > 0:
        s.add(hboard[hint["position"]["i"]][hint["position"]["j"] - 1] == 0)
    if hint["position"]["j"] < puzzle["width"] - 1:
        s.add(hboard[hint["position"]["i"]][hint["position"]["j"]] == 0)
    if hint["position"]["i"] > 0:
        s.add(vboard[hint["position"]["j"]][hint["position"]["i"] - 1] == 0)
    if hint["position"]["i"] < puzzle["height"] - 1:
        s.add(vboard[hint["position"]["j"]][hint["position"]["i"]] == 0)

    if hint["hint"]["direction"] == "up":
        view = vboard[hint["position"]["j"]][:(hint["position"]["i"] - 1)]
    if hint["hint"]["direction"] == "down":
        view = vboard[hint["position"]["j"]][(hint["position"]["i"] + 1):]
    if hint["hint"]["direction"] == "left":
        view = hboard[hint["position"]["i"]][:(hint["position"]["j"] - 1)]
    if hint["hint"]["direction"] == "right":
        view = hboard[hint["position"]["i"]][(hint["position"]["j"] + 1):]
    if hint["hint"]["direction"]:
        s.add(AtLeast(*[w != 0 for w in view], hint["hint"]["walls"]))
        s.add(AtMost(*[w != 0 for w in view], hint["hint"]["walls"]))

    if (hint["hint"]["color"] == "black" and hint["position"]["j"] > 0
                                         and hint["position"]["j"] < puzzle["width"] - 1
                                         and hint["position"]["i"] > 0
                                         and hint["position"]["i"] < puzzle["height"] - 1):
        view = transpose(hboard)[hint["position"]["j"] - 1][:hint["position"]["i"]]
        if len(view) == 1:
            s.add(view[0] == 0)
        if len(view) >= 2:
            evens = []
            for e in range(0, len(view) + 1, 2):
                evens += [And(AtLeast(*[w != 0 for w in view], e),
                              AtMost(*[w != 0 for w in view], e))]
            s.add(Or(*evens))
    if hint["hint"]["color"] == "white":
        view = transpose(hboard)[hint["position"]["j"] - 1][:hint["position"]["i"]]
        if len(view) == 1:
            s.add(view[0] != 0)
        if len(view) == 2:
            s.add(Or(And(view[0] == 0, view[1] != 0), And(view[0] != 0, view[1] == 0)))
        if len(view) >= 3:
            odds = []
            for o in range(1, len(view) + 1, 2):
                odds += [And(AtLeast(*[w != 0 for w in view], o),
                             AtMost(*[w != 0 for w in view], o))]
            s.add(Or(*odds))

result = { }
result["solutions"] = []

if s.check().r == Z3_L_TRUE:
    result["solutions"] += [{ }]
    for c in s.model():
        result["solutions"][0][c.name()] = s.model()[c].as_long()

    s.add(Not(And(*[variable_ref[v.name()] == s.model()[v] for v in s.model()])))

    if s.check().r == Z3_L_TRUE:
        result["solutions"] += [{ }]
        for c in s.model():
            result["solutions"][1][c.name()] = s.model()[c].as_long()

        result["solvable"] = "ambiguous"
    else:
        result["solvable"] = "unique"
else:
    result["solvable"] = "impossible"

print(json.dumps(result, separators = (",", ":")), end = "")
