import messaging from '@content_scripts/lib/messaging'
import {createAsyncThunk, createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {getErrorMessage} from '@shared/helpers/getErrorMessage'
import type {DetectionTestResults} from 'custom/javascript/bg/src/detection/test/detectionTest'
import {getDefaultRecords} from 'custom/javascript/bg/src/detection/test/testData/testData'
import {windowsCreate} from 'custom/javascript/bg/src/lib/browserCommands/windows/create'
import {windowsGet} from 'custom/javascript/bg/src/lib/browserCommands/windows/get'
import {windowsRemove} from 'custom/javascript/bg/src/lib/browserCommands/windows/remove'
import {TestActionNames} from 'custom/javascript/bg/src/messaging/actionMessageHandler/actionMessages/testAction/actionNameEnums'
import {ActionMessageHandlerNames} from 'custom/javascript/bg/src/messaging/actionMessageHandler/enums'
import {MessagePrefixes} from 'custom/javascript/bg/src/messaging/enums'
import type {FillableRecord} from 'custom/javascript/bg/src/redux-cs/smartfill'
import {urlHelperFactory} from 'custom/javascript/bg/src/urlFunctions/urlHelperFactory'
import type {
  DomainTestBlock,
  DomainTestBlockArray,
} from '../../../javascript/bg/src/detection/test/testData/testDomains'
import type {Record} from '../../../javascript/bg/src/types/cache/record'

type TestResults = {
  sites: {[href: string]: DetectionTestResults}
  skipCount: number
  failCount: number
  passCount: number
  todoCount: number
  totalCount: number
  durationSeconds: number
}

export type TestOptions = {
  skip?: boolean
  only?: boolean
}

type TestOptionsMap = {
  [href: string]: TestOptions
}

export type TestSuiteOption = 'topsites' | 'static' | 'both'

export type TestRunnerState = {
  tests: DomainTestBlockArray
  records: {
    [domain: string]: Record
  }
  results: TestResults | null
  options: TestOptionsMap
  pending: boolean
  suite: TestSuiteOption
  error: string | null
}

const initialState: TestRunnerState = {
  tests: [],
  records: {},
  results: null,
  options: {},
  pending: false,
  suite: 'topsites',
  error: null,
}

const testRunnerSlice = createSlice({
  name: 'testRunner',
  initialState,
  reducers: {
    setTests(state, action: PayloadAction<DomainTestBlockArray>) {
      state.tests = action.payload
    },
    setRecords(state, action: PayloadAction<{[domain: string]: Record}>) {
      state.records = action.payload
    },
    setResults(state, action: PayloadAction<TestResults>) {
      state.results = action.payload
    },
    setOptions(state, action: PayloadAction<TestOptionsMap>) {
      state.options = Object.assign({}, state.options, action.payload)
    },
    setPending(state) {
      state.pending = true
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload
    },
    clearResults(state) {
      state.results = null
    },
    clearOptions(state) {
      state.options = {}
    },
    clearPending(state) {
      state.pending = false
    },
    setTestSuite(state, action: PayloadAction<TestSuiteOption>) {
      state.suite = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
})

// REDUCER
export default testRunnerSlice.reducer

// ACTIONS
export const {
  setTests,
  setResults,
  setOptions,
  setError,
  clearOptions,
  clearResults,
  clearError,
  setRecords,
  setPending,
  clearPending,
  setTestSuite,
} = testRunnerSlice.actions

// SELECTORS
export const selectSuite = (state: TestRunnerState) => state.suite
export const selectTests = (state: TestRunnerState) => state.tests
export const selectSuiteTests = createSelector([selectSuite, selectTests], (suite, tests) => {
  switch (suite) {
    case 'topsites':
      return tests.filter((test) => {
        const [href] = Object.keys(test)
        return !href.includes('localhost')
      })
    case 'static':
      return tests.filter((test) => {
        const [href] = Object.keys(test)
        return href.includes('localhost')
      })
    case 'both':
    default:
      return tests
  }
})
export const selectOptions = (state: TestRunnerState) => state.options
export const selectResults = (state: TestRunnerState) => state.results
export const selectError = (state: TestRunnerState) => state.error
export const selectRecords = (state: TestRunnerState) => state.records
export const selectPending = (state: TestRunnerState) => state.pending
export const selectFilteredTests = createSelector(
  [selectSuiteTests, selectOptions],
  (tests, options) => {
    let onlyMode: boolean = false
    return tests.reduce((domains, testBlock) => {
      const [href, test] = Object.entries(testBlock)[0]
      const testOptions = options[href]
      if (testOptions?.skip || test.todo) {
        return domains
      }

      if (!onlyMode && testOptions?.only) {
        // found the first only, reset the domains array
        onlyMode = true
        domains.length = 0
      }

      if (onlyMode) {
        if (testOptions?.only) {
          domains.push(testBlock)
        }
      } else {
        domains.push(testBlock)
      }

      return domains
    }, [] as DomainTestBlockArray)
  }
)

const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: TestRunnerState
}>()

// THUNKS
export const runTests = createAppAsyncThunk<TestResults, DomainTestBlockArray>(
  'testRunner/runTests',
  async (testsToRun, thunkAPI) => {
    const state = thunkAPI.getState()
    const pending = selectPending(state)
    const suiteTests = selectSuiteTests(state)
    const currentResults = selectResults(state)

    // init results
    const startTime = Date.now()
    const results: TestResults = {
      sites: Object.assign({}, currentResults?.sites),
      skipCount: 0,
      failCount: 0,
      passCount: 0,
      todoCount: 0,
      totalCount: suiteTests.length,
      durationSeconds: 0,
    }

    // exit if pending
    if (pending) {
      return results
    }

    // start pending spinner, clear last results
    thunkAPI.dispatch(setPending())
    thunkAPI.dispatch(clearResults())
    thunkAPI.dispatch(clearError())

    // setup tests
    await setupTests()
    await createTestingWindow()

    // run tests
    for (const testBlock of testsToRun) {
      const href = Object.keys(testBlock)[0]
      try {
        const result = await thunkAPI.dispatch(runTest(testBlock)).unwrap()
        results.sites[href] = result
      } catch (e) {
        const errorMessage = getErrorMessage(e)
        let currentError = selectError(thunkAPI.getState()) || ''
        currentError += `\n${errorMessage}`
        thunkAPI.dispatch(setError(currentError))
        results.sites[href] = {pass: false, tests: [], results: {}}
      }
    }

    // finishing processing results
    results.durationSeconds = (Date.now() - startTime) / 1000
    for (const testBlock of suiteTests) {
      const [href, test] = Object.entries(testBlock)[0]

      const result = results.sites[href]
      if (result) {
        if (result.pass) {
          results.passCount++
        } else {
          results.failCount++
        }
      } else if (test.todo) {
        results.todoCount++
      } else {
        results.skipCount++
      }
    }

    // set results
    thunkAPI.dispatch(setResults(results))

    // cleanup
    await cleanupTests()
    await removeTestingWindow()

    // end pending spinner
    thunkAPI.dispatch(clearPending())

    return results
  }
)

export type FillTestMessageData = {
  test: DomainTestBlock
  record: FillableRecord
  windowId: number
}

export const runTest = createAppAsyncThunk<DetectionTestResults, DomainTestBlock>(
  'testRunner/runTest',
  async (test: DomainTestBlock, thunkAPI): Promise<DetectionTestResults> => {
    const state = thunkAPI.getState() as TestRunnerState
    const {records} = state

    const [href, testBlock] = Object.entries(test)[0]
    const domain = urlHelperFactory(href, 1, 2)

    // get test record
    const recordType = testBlock.recordType
    const defaultRecords = getDefaultRecords()
    let record: FillableRecord
    if (testBlock.needsCredentials) {
      record = records[domain]
      if (!record) {
        throw new Error(`No record found for ${domain}`)
      }
    } else {
      record = defaultRecords[recordType]
    }

    // execute the test
    return new Promise<DetectionTestResults>(async (resolve) => {
      const data: FillTestMessageData = {test, record, windowId: await getTestingWindowId()}
      messaging.sendMessage(
        ActionMessageHandlerNames.TEST_ACTION,
        {
          type: MessagePrefixes.ACTION,
          data: {[TestActionNames.DETECTION]: true, data},
        },
        (result: DetectionTestResults) => {
          resolve(result)
        }
      )
    })
  }
)

let testingWindowId: number | null = null

async function createTestingWindow(): Promise<void> {
  const window = await windowsCreate({
    incognito: true,
  })
  if (!window?.id) {
    throw new Error('Could not create testing window')
  }
  testingWindowId = window.id
}

async function getTestingWindowId(): Promise<number> {
  if (!testingWindowId || !(await windowsGet(testingWindowId))) {
    await createTestingWindow()
  }
  return testingWindowId as number
}

async function removeTestingWindow(): Promise<void> {
  if (!testingWindowId) return
  if (await windowsGet(testingWindowId)) {
    await windowsRemove(testingWindowId)
    testingWindowId = null
  }
}

function setupTests(): Promise<void> {
  return new Promise((resolve) => {
    messaging.sendMessage(
      ActionMessageHandlerNames.SETUP_DETECTION_TESTS,
      {
        type: MessagePrefixes.ACTION,
      },
      resolve
    )
  })
}

function cleanupTests(): Promise<void> {
  return new Promise((resolve) => {
    messaging.sendMessage(
      ActionMessageHandlerNames.CLEANUP_DETECTION_TESTS,
      {
        type: MessagePrefixes.ACTION,
      },
      resolve
    )
  })
}
