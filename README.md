# Determine Environment Action :mag:

Determine the environment based on the branch name.

## Usage

```yaml
- uses: fdev/determine-env-action@v1
  with:
    default: 'develop'
    mapping: '{ "feature/*": "acceptance", "master": "production" }'
```

## Inputs

| Name      | Description                                             | Default |      Required      |
|-----------|---------------------------------------------------------|---------|:------------------:|
| `mapping` | Mapping of branch names to environments.                |         | :heavy_check_mark: |
| `default` | Default environment.                                    |         | :heavy_check_mark: |
| `export`  | Should the result be exported as environment variables. | `true`  |        :x:         |

The `mapping` variable should contain a JSON object where the key represents a branch name and the value the environment it should be mapped to. Wildcards (`*`) can be used and when multiple keys match the longest key is used.

## Outputs

| Name          | Description                         |
|---------------|-------------------------------------|
| `environment` | Name of the determined environment. |
| `branch`      | Name of the determined branch.      |
