# is-release-open-action

How to use this action:

1. Create a folder in your project named `.workflows`

2. Create a file inside of it named `is-release-opened.yml`

3. Add into it:

```yml
on:
  pull_request:
    types:
      - open
  push:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check opened release
        id: hello
        uses: jpacareu-meli/is-release-open-action@v1
```

4. Push your files.
