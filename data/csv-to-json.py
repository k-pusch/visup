# coding=utf-8

import codecs
import json

from csv import DictReader
from functools import partial

separators = (',', ':')

utf8 = partial(unicode, encoding='utf-8')

HEADERS = (
    ('Name', 'name', utf8),
    ('Jahr', 'year', int),
    ('Betrag', 'val', float),
    ('Partei', 'party', utf8),
    ('Straße', 'street', utf8),
    ('Postleitzahl', 'plz', str),
    ('Stadt', 'city', utf8),
    ('Typ', 'typ', str),
)

with open('parteispenden.csv', 'rb') as fh:
    reader = DictReader(fh, delimiter=b';')

    data = [{
        field: converter(row[header])
        for header, field, converter in HEADERS
    } for row in reader]


for entry in data:
    name = entry['name']

    if ',' in name:
        name = entry['name'] = ' '.join(reversed(map(unicode.strip, name.split(','))))


with codecs.open('parteispenden.json', 'wb', 'utf-8') as fh:
    json.dump(data, fh, ensure_ascii=False)
