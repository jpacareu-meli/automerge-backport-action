# automerge-backport-action

This action was created in order to auto approve and merge all the *backport/master_* branches created by github and fury when a *release* branch is merged into *master*.

To use this action you should follow these steps:

1. Create a folder in your project named `.github` and inside create another folder named `workflows`

2. Create a file inside of `workflows` named `automerge-backport.yml`

3. Add into it:

```yml
name: Automerge Backport Pull Request
on:
  pull_request:
    types:
      - opened
    branches:
      - develop
jobs:
  build:
    if: contains(github.head_ref, 'backport/master_')
    runs-on: ubuntu-latest
    steps:
      - name: 
        uses: jpacareu-meli/automerge-backport-action@v1.0
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

4. Push your files and open a Pull Request with the changes.
