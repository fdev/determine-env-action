'use strict'

const core = require('@actions/core')

/**
 * Returns an environment variable or fail it is empty.
 */
function getVariable(key) {
  const ref = process.env[key]

  if (!ref) {
    throw new Error(`Unexpected empty value for ${key}.`)
  }

  return ref
}

/**
 * The branch or tag ref that triggered the workflow.
 */
function determineRef() {
  const event = process.env.GITHUB_EVENT_NAME

  if (event === 'pull_request') {
    core.info(`Event type 'pull_request', using GITHUB_HEAD_REF for ref`)
    return getVariable('GITHUB_HEAD_REF')
  }

  core.info(`Using GITHUB_REF for ref`)
  return getVariable('GITHUB_REF')
}

/**
 * Returns the branch name from the GITHUB_REF_NAME environment variable.
 */
function getBranch() {
  const ref = determineRef()

  const regex = /refs\/(heads|tags|pull)\/(\S+)/
  const match = ref.match(regex)
  
  if (!match) {
    throw new Error(`Unexpected format of ref (${ref}).`)
  }

  return match[2]
}

/**
 * Returns the action input variable `mapping` and validates its content.
 */
function getMapping() {
  const mapping = JSON.parse(core.getInput('mapping', { required: true }))
  
  // Make sure mapping is what we expect.
  for (var key in mapping) {
    if (typeof mapping[key] !== 'string') {
      throw new Error('Environments in mapping should be strings.')
    }
  }

  return mapping
}

/**
 * Escapes the `RegExp` special characters.
 */
function escapeRegExp(string) {
  return string.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
}

/**
 * Converts a wildcard string into a RegExp.
 *
 * develop -> ^develop$
 * feature/* -> ^feature\/.*$
 */
function wildcardToRegex(wildcard) {
  return RegExp(`^${wildcard.split('*').map(escapeRegExp).join('.*')}$`)
}

/**
 * Applies the mapping to the current branch or returns the fallback.
 */
function matchBranch(branch, mapping, fallback) {
  // Sort by length so longest key gets matched first.
  const keys = Object.keys(mapping).sort().reverse()

  const match = keys.find(key => {
    const regex = wildcardToRegex(key);
    return regex.test(branch);
  })

  return match ? mapping[match] : fallback
}

/**
 * Entrypoint of the action.
 */
async function run() {
  try {
    const mapping = getMapping()
    const fallback = core.getInput('default', { required: true })
    const branch = getBranch()

    core.info(`Determine environment for branch ${branch}`)

    const environment = matchBranch(branch, mapping, fallback)
    core.setOutput('environment', environment)
    core.setOutput('branch', branch)
  }
  catch (err) {
    core.setFailed(err.message)
  }
}

if (require.main === module) {
  run()
}
