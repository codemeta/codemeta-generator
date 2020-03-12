# Codemeta Generator

This repository contains a (client-side) web application to generate
CodeMeta documents (aka. `codemeta.json`).

The [CodeMeta initiative](https://github.com/codemeta/codemeta) is a Free and Open Source academic collaboration
creating a minimal metadata schema for research software and code.

The academic community recommands on adding a codemeta.json file in
the root directory of your repository.

With this linked data metadata file, you can easily declare the authorship,
include contextual information and link to other research outputs (publications,
data, etc.).

Also, the `codemeta.json` file in your source code is indexed in the
Software Heritage (SWH) archive, which will improve findability in searches.

### References

- [SWH guidelines](https://www.softwareheritage.org/save-and-reference-research-software/) for research software.

- [SWH blog post](https://www.softwareheritage.org/2019/05/28/mining-software-metadata-for-80-m-projects-and-even-more/) about metadata indexation.
- [Dan S. Katz's blog post](https://danielskatzblog.wordpress.com/2017/09/25/software-heritage-and-repository-metadata-a-software-citation-solution/) about including
 metadata in your repository.
- FORCE11's Software Citation Implementation WG [repository](https://github.com/force11/force11-sciwg)
- RDA & FORCE11's joint Software Source Code Identification WG
   [repository](https://github.com/force11/force11-rda-scidwg)

## Running it

Start an HTTP server serving the files (nginx, etc.).

The simplest way is probably to use Python's HTTP server:

```
git clone https://forge.softwareheritage.org/source/codemeta-generator.git
cd codemeta-generator
python3 -m http.server
```

then open [http://localhost:8000/](http://localhost:8000/) in your web browser.

## Specifications

### Use case

1. create a complete codemeta.json file from scratch
2. aggregate existing information and add complementary information to
a codemeta.json file

### Functionalities

- helpers while completing the form, for example a reference list of spdx
  licenses
- a validation mechanism after submission
- the possibility to use all the codeMeta terms and schema.org terms
- accessible from multiple platforms (web browsers or OS)
- (extra) the possibility to correct the output after validation as part
  of the creation process

This tool was initially prepared for the [FORCE19 Hackathon](https://github.com/force11/force11-rda-scidwg/tree/master/hackathon/FORCE2019).

Contributed by

![Image description](https://annex.softwareheritage.org/public/logo/software-heritage-logo-title-motto.svg)
