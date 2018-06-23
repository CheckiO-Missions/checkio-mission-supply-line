"""
TESTS is a dict with all you tests.
Keys for this will be categories' names.
Each test is dict with
    "input" -- input data for user function
    "answer" -- your right answer
    "explanation" -- not necessary key, it's using for additional info in animation.
"""
from random import choices, randint
from my_solution import supply_line 
from string import ascii_uppercase

hexes = set(x + str(i) for x in ascii_uppercase[:12] for i in range(1, 10))
randoms = []

for _ in range(10):
    d = [1, 1, 1, 1, 2, 2][randint(0, 5)]
    e = [4, 5, 6, 7, 8, 9][randint(0, 5)]

    depots = choices(list(hexes), k=d)
    enemies = choices(list(hexes-set(depots)), k=e)
    you = choices(list(hexes-set(depots)-set(enemies)), k=1)
    randoms.append([you[0], depots, enemies])



basics = [
    ['B4', ['F4'], ['D4']],
    ['A3', ['A9', 'F5', 'G8'], ['B3', 'G6']],
    ['C2', ['B9', 'F6'], ['B7', 'E8', 'E5', 'H6']],
    ['E5', ['C2', 'B7', 'F8'], []],
    ['A5', ['A2', 'B9'], ['B3', 'B7', 'E3', 'E7']],
];


def make_tests(inputs):
    tests = []
    for ip in inputs:
        you, depots, enemies = ip
        result = supply_line(you, set(depots), set(enemies))
        tests.append({
            'input': list(ip),
            'answer': len(result)-1 if result else None,
            'explanation': result,
            })
    return tests


TESTS = {
    "Basics": make_tests(basics),
    "Randoms": make_tests(randoms),
}
