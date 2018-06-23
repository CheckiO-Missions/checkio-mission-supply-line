from string import ascii_uppercase as au
from operator import or_
from functools import reduce

MAX_COL = 'L'


def adjacent_hexes(hex_id):
    col, row = au.index(hex_id[0]), int(hex_id[1])
    t_row = row + col % 2 - 1
    b_row = row + col % 2

    adj_hexes = set()

    if row - 1 > 0:
        adj_hexes.add((col, row-1))

    if row + 1 < 10:
        adj_hexes.add((col, row+1))

    if col+1 <= au.index(MAX_COL):
        if t_row > 0:
            adj_hexes.add((col+1, t_row))
        if b_row < 10:
            adj_hexes.add((col+1, b_row))

    if col-1 >= 0:
        if t_row > 0:
            adj_hexes.add((col-1, t_row))
        if b_row < 10:
            adj_hexes.add((col-1, b_row))

    return set(map(lambda a: au[a[0]]+str(a[1]), adj_hexes))


def rev_steps(all_steps, depots):
    goal = list(all_steps.pop() & depots)[0]
    result = [goal]
    while all_steps:
        result.append(list(adjacent_hexes(result[-1]) & all_steps.pop())[0])
    return list(reversed(result))


def supply_line(you, depots, enemies):

    x_hexes = reduce(or_, map(adjacent_hexes, enemies), set())
    next_hexes = {you}
    done_hexes = {you}
    steps = 1

    all_steps = []
    while next_hexes:
        all_steps.append(next_hexes)
        search_hexes = next_hexes
        next_hexes = set()

        for nx in search_hexes:
            next_hexes |= adjacent_hexes(nx) - x_hexes
            if depots & next_hexes:
                all_steps.append(next_hexes)
                return rev_steps(all_steps, depots)

        next_hexes -= done_hexes
        done_hexes |= next_hexes
        steps += 1
    return []
