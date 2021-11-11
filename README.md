# Determine Environment Action :mag:

Determine the environment based on the branch name.

## Usage

```yaml
- uses: fdev/determine-env-action@v1
  with:
    default: 'develop'
    mapping: '{ "feature/*": "acceptance", "master": "production" }'
  id: env

- run: echo ${{ steps.env.outputs.environment }}
```

## Inputs

| Name       | Description                                  |      Required      |
|------------|----------------------------------------------|:------------------:|
| `mapping`  | Mapping of branch names to environments.     | :heavy_check_mark: |
| `default`  | Default environment.                         | :heavy_check_mark: |
| `variable` | Environment variable to store the result in. |        :x:         |


## Outputs

| Name          | Description                         |
|---------------|-------------------------------------|
| `environment` | Name of the determined environment. |
