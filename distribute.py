#!/usr/bin/env python

import os
import subprocess
import sys

from zipfile import ZipFile, ZIP_DEFLATED


os.environ['PATH'] += os.pathsep + '/usr/local/bin/'


PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(PROJECT_DIR, 'assets')

SCSS_COMPILER = 'sass'
JSX_COMPILER = 'babel'

EXCLUDE = {
    'node_modules',
    'preprocessing',
    'package.json',
    '.zip',
    '.py',
    '.iml',
}


def compile_scss(path, name, extension):
    if name.startswith('_'):
        return None  # sccs files starting with an underscore are included by other files and could be ignored

    input_filepath = os.path.join(path, name + extension)
    output_filepath = os.path.join(path, '%s.css' % name)

    return subprocess.check_call([SCSS_COMPILER, input_filepath, output_filepath])


def compile_jsx(path, name, extension):
    input_filepath = os.path.join(path, name + extension)
    output_filepath = os.path.join(path, '%s.js' % name)

    return subprocess.check_call([JSX_COMPILER, input_filepath, '-o', output_filepath, '--presets', 'es2015,react'])


COMPILERS = {
    '.sass': compile_scss,
    '.scss': compile_scss,
    '.jsx': compile_jsx,
}


def compile_assets(path, compilers):
    for root, _, filenames in os.walk(path):
        for filename in filenames:
            name, extension = os.path.splitext(filename)

            if extension in compilers:
                compiler = compilers[extension]

                sys.stdout.write('Compiling %s ...\n' % filename)

                try:
                    compiler(root, name, extension)
                except Exception as error:
                    sys.stderr.write('Could not compile %s: %s\n' % (filename, error))


def exclude(root, *path):
    absolute = os.path.join(*path)
    relative = os.path.relpath(absolute, root)

    if os.path.isdir(absolute):
        name, extension = os.path.basename(absolute), None
    elif os.path.isfile(absolute):
        filename = os.path.basename(absolute)
        name, extension = os.path.splitext(filename)
    else:
        return True

    if relative.startswith('.') and not relative == '.':
        return True

    if name.startswith('.') and not name == '.':
        return True

    if extension in EXCLUDE:
        return True

    if extension in COMPILERS:
        return True

    for excl in EXCLUDE:
        if relative.startswith(excl):
            return True

    return False


def store(archive, path):
    for root, _, filenames in os.walk(path):
        if exclude(path, root):
            continue

        for filename in filenames:
            if exclude(path, root, filename):
                continue

            filepath = os.path.join(root, filename)
            relative = os.path.relpath(filepath, path)

            archive.write(filepath, arcname=relative, compress_type=ZIP_DEFLATED)


def archive_project(path):
    try:
        commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'])
    except subprocess.CalledProcessError:
        commit = 'initial'

    filename = 'visup-%s.zip' % commit[:8]
    filepath = os.path.join(path, filename)

    with ZipFile(filepath, 'w', compression=ZIP_DEFLATED) as archive:
        store(archive, path)

    return filepath


if __name__ == '__main__':
    sys.stdout.write('Compiling assets ...\n')
    compile_assets(ASSETS_DIR, COMPILERS)

    sys.stdout.write('Archiving project ...\n')
    result = archive_project(PROJECT_DIR)
    subprocess.call(['open', '-R', result])
