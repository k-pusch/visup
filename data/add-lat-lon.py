# coding=utf-8

import codecs
import json

separators = (',', ':')
umlauts = u'ßäöüÄÖÜ'
nothing = u''
renames = {
    u'Rdesheimer Str,20': u'Rdesheimer Str, 20',
}


def parse(street, plz, city, lat=None, lon=None, **unused):
    return (street, plz, city), (lat, lon)


def sanitize(string):
    for umlaut in umlauts:
        string = string.replace(umlaut, nothing)

    return renames.get(string, string)


with codecs.open('parteispenden-damaged.json', 'rb', 'utf-8', errors='ignore') as fh:
    content = json.load(fh)

data = {}

for entry in content:
    key, value = parse(**entry)
    data[key] = value


with codecs.open('parteispenden.json', 'rb', 'utf-8') as fh:
    entries = json.load(fh)

for entry in entries:
    key, _ = parse(**entry)
    key = tuple(map(sanitize, key))
    entry['lat'], entry['lon'] = data[key]

with codecs.open('parteispenden.json', 'wb', 'utf-8') as fh:
    json.dump(entries, fh, ensure_ascii=False, separators=separators)
