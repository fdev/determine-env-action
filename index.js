'use strict'

import { exportVariable, getInput, info, setOutput, setFailed } from '@actions/core'

/**
 * Returns the branch name based on the GITHUB_REF environment variable.
 *
 * refs/heads/develop -> develop
 * refs/heads/feature/something-awesome -> feature/something-awesome
 * refs/tags/main -> main
 */
function getBranch() {
  const ref = process.env.GITHUB_REF

  if (!ref) {
    throw new Error('Was not able to get GITHUB_REF from environment.')
  }

  const regex = /refs\/(heads|tags)\/(\S+)/
  const match = ref.match(regex)
  
  if (!match) {
    throw new Error('Unexpected format of GITHUB_REF.')
  }

  return match[2]
}

/**
 * Returns the action input variable `mapping` and validates its content.
 */
function getMapping() {
  const mapping = JSON.parse(getInput('mapping'))
  
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
    const branch = getBranch()
    const fallback = getInput('default')
    const mapping = getMapping()
    const variable = getInput('variable')

    info(`Determine environment for branch ${branch}`)

    const environment = matchBranch(branch, mapping, fallback)
    setOutput('environment', environment)

    if (variable) {
      info(`Exporting to environment variable ${variable}`)
      exportVariable(variable, environment)
    }
  }
  catch (err) {
    setFailed(err.message)
  }
}

if (require.main === module) {
  run()
}

export default run;
