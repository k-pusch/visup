function formatCurrency (value) {
    var fixed = value.toFixed(2),
        bits = fixed.split('.'),
        number = bits[0],
        decimal = bits[1];

    if (number.length <= 3) {
        return number + ',' + decimal;
    }

    var remainder = number.length % 3,
        head, tail, groups;

    if (remainder) {
        head = number.substr(0, remainder);
        tail = number.substr(remainder);
        groups = [head];

    } else {
        tail = number;
        groups = [];
    }

    for (var start = 0; start < tail.length; start += 3) {
        groups.push(tail.substr(start, 3));
    }

    return groups.join('.') + ',' + decimal;
}
