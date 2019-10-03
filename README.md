# Codemeta Generator

This repository contains a (client-side) web application to generate
Codemeta documents (aka. `codemeta.json`).

## Running it

Start an HTTP server serving the files (nginx, etc.).

The simplest way is probably to use Python's HTTP server:

```
git clone https://forge.softwareheritage.org/source/codemeta-generator.git
cd codemeta-generator
python3 -m http.server
```

then open [http://localhost:8000/](http://localhost:8000/) in your web browser.
