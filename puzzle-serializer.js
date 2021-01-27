module.exports.serialize = function serialize(puzzle) {
    let cboard = [];
    for (let i = 0; i < puzzle.height; i++) {
        cboard.push([]);
        for (let j = 0; j < puzzle.width; j++) {
            cboard[i].push('e'); // e for empty
        }
    }

    puzzle.hints.forEach(h => {
        if (h.hint.direction) {
            cboard[h.position.i][h.position.j] = h.hint.direction[0] + h.hint.walls + h.hint.color[0];
        }
        else {
            cboard[h.position.i][h.position.j] = h.hint.color[0];
        }
    });

    let result = '';
    result += puzzle.width + ',';

    let empty_count = 0;
    cboard.forEach(line => {
        line.forEach(cell => {
            if (cell == 'e') {
                empty_count += 1;
            }
            else {
                if (empty_count > 0) {
                    result += empty_count;
                    empty_count = 0;
                }

                result += cell;
            }
        });
    });
    if (empty_count > 0) {
        result += empty_count;
    }

    return result;
}

module.exports.deserialize = function deserialize(ser_string) {
    let s = ser_string;
    let pos = 0;
    while (s[pos] != ',') {
        pos += 1;
    }
    let width = +s.substr(0, pos);
    s = s.substr(pos + 1);

    let puzzle = { };
    puzzle.hints = [];

    let empties = 0;
    let row = 0;
    while (!(s.length == 0 && empties == 0)) {
        for (let col = 0; col < width; col++) {
            if (empties > 0) {
                empties -= 1;
                continue;
            }
            else if (s[0] == 'b' || s[0] == 'g' || s[0] == 'w') {
                let color = s.substr(0, 1);
                s = s.substr(1);
                let h = { };
                h.position = { };
                h.position.i = row;
                h.position.j = col;
                h.hint = { };
                h.hint.direction = null;
                h.hint.walls = null;
                switch (color) {
                    case 'b':
                        h.hint.color = 'black';
                        break;
                    case 'g':
                        h.hint.color = 'grey';
                        break;
                    case 'w':
                        h.hint.color = 'white';
                        break;
                }
                puzzle.hints.push(h);
            }
            else if (s[0] == 'u' || s[0] == 'd' || s[0] == 'l' || s[0] == 'r') {
                let direction = s.substr(0, 1);
                s = s.substr(1);
                pos = 0;
                while (s[pos] != 'b' && s[pos] != 'g' && s[pos] != 'w') {
                    pos += 1;
                }
                let walls = +s.substr(0, pos);
                s = s.substr(pos);
                let color = s.substr(0, 1);
                s = s.substr(1);
                let h = { };
                h.position = { };
                h.position.i = row;
                h.position.j = col;
                h.hint = { };
                switch (direction) {
                    case 'u':
                        h.hint.direction = 'up';
                        break;
                    case 'd':
                        h.hint.direction = 'down';
                        break;
                    case 'l':
                        h.hint.direction = 'left';
                        break;
                    case 'r':
                        h.hint.direction = 'right';
                        break;
                }
                h.hint.walls = walls;
                switch (color) {
                    case 'b':
                        h.hint.color = 'black';
                        break;
                    case 'g':
                        h.hint.color = 'grey';
                        break;
                    case 'w':
                        h.hint.color = 'white';
                        break;
                }
                puzzle.hints.push(h);
            }
            else if (s.length > 0 && s[0] != 'b' && s[0] != 'g' && s[0] != 'w' && s[0] != 'u' && s[0] != 'd' && s[0] != 'l' && s[0] != 'r') {
                pos = 1;
                while (pos < s.length && s[pos] != 'b' && s[pos] != 'g' && s[pos] != 'w' && s[pos] != 'u' && s[pos] != 'd' && s[pos] != 'l' && s[pos] != 'r') {
                    pos += 1;
                }

                empties = +s.substr(0, pos);
                s = s.substr(pos);

                empties -= 1;
            }
        }
        
        row += 1;
    }

    puzzle.width = width;
    puzzle.height = row;

    return puzzle;
}
