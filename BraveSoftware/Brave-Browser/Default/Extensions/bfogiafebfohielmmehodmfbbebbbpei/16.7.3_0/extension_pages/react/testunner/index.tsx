import {getErrorMessage} from '@shared/helpers/getErrorMessage'
import Check from '@shared/svgMaker/check'
import Close from '@shared/svgMaker/close'
import Edit from '@shared/svgMaker/edit'
import KeeperCoin from '@shared/svgMaker/KeeperCoin'
import TriangleWarning from '@shared/svgMaker/triangleWarning'
import classNames from 'classnames'
import {getTestDomains} from 'custom/extension_pages/lib/getTestDomains'
import type {DetectionTestResults} from 'custom/javascript/bg/src/detection/test/detectionTest'
import type {DomainTestBlock} from 'custom/javascript/bg/src/detection/test/testData/testDomains'
import React, {useCallback, useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import {useDispatch, useSelector} from 'react-redux'
import type {Record} from '../../../javascript/bg/src/types/cache/record'
import {isRecordV3} from '../../../javascript/bg/src/types/cache/record'
import {extractURLField} from '@shared/Records/record-types-utils'
import {importRecords} from '../../lib/importRecords'
import {
  clearError,
  clearResults,
  runTests,
  selectError,
  selectFilteredTests,
  selectOptions,
  selectResults,
  selectSuite,
  selectSuiteTests,
  setError,
  setOptions,
  setRecords,
  setTests,
  setTestSuite,
  TestOptions,
  TestSuiteOption,
} from '../../redux/testrunner'
import {urlHelperFactory} from 'custom/javascript/bg/src/urlFunctions/urlHelperFactory'

export const App: React.FC = () => {
  const dispatch = useDispatch()
  const error = useSelector(selectError)

  // fetch tests
  useEffect(() => {
    getTestDomains().then((tests) => dispatch(setTests(tests)))
  }, [])

  return (
    <>
      <Header />
      <div className="container my-4">
        <Instructions />
        <Form />
        {error && <TestError message={error} />}
        <Table />
      </div>
    </>
  )
}

const testSuiteOptions: [TestSuiteOption, string][] = [
  ['topsites', 'Topsites'],
  ['static', 'Static'],
  ['both', 'Both'],
]

const TestSuiteChoice: React.FC = () => {
  const dispatch = useDispatch()
  const suite = useSelector(selectSuite)

  const onOptionClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const {name} = event.currentTarget
    dispatch(clearResults())
    dispatch(setTestSuite(name as TestSuiteOption))
  }

  return (
    <div className="btn-group btn-group-sm mb-3" role="group" aria-label="Test Suite Choice">
      {testSuiteOptions.map(([option, label]) => (
        <button
          key={option}
          type="button"
          className={classNames('btn', 'btn-outline-primary', {
            active: suite === option,
          })}
          name={option}
          onClick={onOptionClick}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

const zipLink = chrome.runtime.getURL('sites.zip')
const mdnLink =
  'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server#using_python'

const Instructions: React.FC = () => {
  const suite = useSelector(selectSuite)
  const includeTopsitesInstructions = suite === 'topsites' || suite === 'both'
  const includeStaticInstructions = suite === 'static' || suite === 'both'

  return (
    <div>
      <p>
        This tool allows you to run browser extension autofill tests for a suite of websites we need
        to support.
      </p>
      <TestSuiteChoice />
      <p>
        <strong>Setup Instructions:</strong>
      </p>
      <ol>
        <li>Enable extension access to private or incognito windows</li>
        {includeTopsitesInstructions && (
          <>
            <li>
              Export the latest records from the Keeper QA account (keeper.be.tester@gmail.com) as a
              CSV file.
            </li>
            <li>Import the CSV file below.</li>
          </>
        )}
        {includeStaticInstructions && (
          <>
            <li>
              (Windows only) Install Python if you don't already have it, following MDN
              instructions:{' '}
              <a href={mdnLink} target="_blank" rel="noopener noreferrer">
                link
              </a>
            </li>
            <li>
              Download the latest static test pages:{' '}
              <a download href={zipLink}>
                link
              </a>
            </li>
            <li>
              Unzip the folder, navigate inside it in your terminal, and run{' '}
              <code>python3 -m http.server 8124</code>.
              <ul>
                <li>
                  If running from Windows Powershell, run <code>python -m http.server 8124</code>{' '}
                  instead.
                </li>
              </ul>
            </li>
          </>
        )}
        <li>
          Make sure you're logged out of Keeper (in this browser) before triggering the tests.
        </li>
        <li>
          Click the <strong>Run Tests</strong> button to run the entire suite.
        </li>
        <li>Optionally, you can re-run a specific test by just clicking on the domain link.</li>
      </ol>
    </div>
  )
}

type ErrorProps = {
  message: string
}

const TestError: React.FC<ErrorProps> = (props) => {
  const {message} = props
  const dispatch = useDispatch()
  const handleClose = () => {
    dispatch(clearError())
  }
  return (
    <div
      className="alert alert-danger d-flex align-items-center justify-content-between gap-2"
      role="alert"
    >
      <TriangleWarning width={24} height={24} svgColorName="currentcolor" />
      <span className="col mr-auto">{message}</span>
      <button type="button" className="btn-close" aria-label="Close" onClick={handleClose}></button>
    </div>
  )
}

const Header: React.FC = () => {
  return (
    <header className="navbar sticky-top bg-body-tertiary">
      <div className="container justify-content-start">
        <a className="navbar-brand" href="#">
          <KeeperCoin width={32} height={32} />
        </a>
        Browser Extension Test Runner
      </div>
    </header>
  )
}

const Form: React.FC = () => {
  const dispatch = useDispatch()
  const [fileUploadSuccess, setFileUploadSuccess] = useState<boolean | null>(null)
  const tests = useSelector(selectFilteredTests)

  const runTestsClicked = () => {
    dispatch(runTests(tests))
  }

  const resetClicked = () => {
    location.reload()
  }

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      // check for file
      const fileInput = event.target
      if (!fileInput.files?.length) {
        throw new Error('No records file selected')
      }
      const file = fileInput.files[0]
      if (file.type !== 'text/csv') {
        throw new Error(
          `Unsupported file type: "${file.type}". Please submit a Keeper exported CSV file.`
        )
      }

      // process file
      const data = await readFile(file)
      const records = importRecords({fileType: file.type, fileContent: data})
      const recordsByDomain = processRecordsByDomain(records)
      setFileUploadSuccess(true)
      dispatch(setRecords(recordsByDomain))
      dispatch(clearError())
    } catch (e) {
      setFileUploadSuccess(false)
      const message = getErrorMessage(e)
      dispatch(setError(message))
    }
  }

  const fileInputClasses = classNames('form-control', {
    'is-valid': fileUploadSuccess,
    'is-invalid': fileUploadSuccess === false,
  })

  return (
    <div className="row my-3 align-items-center justify-content-between">
      <div className="col-auto">
        <label htmlFor="recordsFile" className="col-form-label">
          Records Import:
        </label>
      </div>
      <div className="col-auto me-auto">
        <input type="file" id="recordsFile" className={fileInputClasses} onChange={onFileChange} />
      </div>
      <div className="col-auto">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!fileUploadSuccess}
          onClick={runTestsClicked}
        >
          Run Tests
        </button>
      </div>
      <div className="col-auto">
        <button type="button" className="btn btn-secondary" onClick={resetClicked}>
          Reset
        </button>
      </div>
    </div>
  )
}

const TableCaption: React.FC = () => {
  const results = useSelector(selectResults)
  if (!results) {
    return null
  }

  const spans: JSX.Element[] = []
  if (results.failCount > 0) {
    spans.push(
      <span key="failcount" className="text-danger fw-semibold">
        {results.failCount} failed
      </span>,
      <span key="failcount-comma">, </span>
    )
  }
  if (results.skipCount > 0) {
    spans.push(
      <span key="skipcount" className="text-warning fw-semibold">
        {results.skipCount} skipped
      </span>,
      <span key="skipcount-comma">, </span>
    )
  }
  if (results.todoCount > 0) {
    spans.push(
      <span key="todocount" className="fw-semibold" style={{color: 'var(--bs-pink)'}}>
        {results.todoCount} todo
      </span>,
      <span key="todocount-comma">, </span>
    )
  }
  if (results.passCount > 0) {
    spans.push(
      <span key="passcount" className="text-success fw-semibold">
        {results.passCount} passed
      </span>,
      <span key="passcount-comma">, </span>
    )
  }
  spans.push(
    <span key="totalcount" className="fw-semibold">
      {results.totalCount} total
    </span>
  )

  return (
    <caption>
      <div>Fill Tests</div>
      <div>{spans}</div>
      <div>{`Time: ${results.durationSeconds.toPrecision(4)} s`}</div>
    </caption>
  )
}

const Table: React.FC = () => {
  const tests = useSelector(selectSuiteTests)
  const options = useSelector(selectOptions)
  const results = useSelector(selectResults)
  const dispatch = useDispatch()

  const updateOptions = useCallback((options: TestOptions, domain: string) => {
    dispatch(setOptions({[domain]: options}))
  }, [])

  return (
    <table className="table table-striped table-bordered caption-top">
      <TableCaption />
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Domain</th>
          <th scope="col">Skip</th>
          <th scope="col">Only</th>
          <th scope="col">Todo</th>
          <th scope="col">Result</th>
        </tr>
      </thead>
      <tbody>
        {tests.map((testBlock, index) => {
          const [href, test] = Object.entries(testBlock)[0]
          const optionsForDomain = options[href]
          const result = results ? results.sites[href] : undefined
          return (
            <TableRow
              key={href}
              testBlock={testBlock}
              index={index}
              options={optionsForDomain}
              result={result}
              todo={test.todo}
              updateOptions={updateOptions}
            />
          )
        })}
      </tbody>
    </table>
  )
}

type TableRowProps = {
  testBlock: DomainTestBlock
  index: number
  options?: TestOptions
  result?: DetectionTestResults
  todo?: boolean
  updateOptions: (options: TestOptions, href: string) => void
}

const TableRow: React.FC<TableRowProps> = (props) => {
  const {index, testBlock, options, result, todo, updateOptions} = props
  const href = Object.keys(testBlock)[0]
  const {skip = false, only = false} = options || {}
  const dispatch = useDispatch()
  const [showResultModal, setShowResultModal] = useState<boolean>(false)

  const onOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {checked, name} = event.target
    const option = Object.assign({}, options)
    option[name as keyof TestOptions] = checked
    updateOptions(option, href)
  }

  const linkClicked = () => {
    dispatch(runTests([testBlock]))
  }

  const onResultClicked = () => {
    setShowResultModal(true)
  }

  const {hostname, pathname} = new URL(href)
  const link = `${hostname}${pathname}`

  return (
    <tr key={href}>
      <th scope="row">{index + 1}</th>
      <td>
        <a href="#" onClick={linkClicked}>
          {link}
        </a>
      </td>
      <td>
        <input
          className="form-check-input"
          type="checkbox"
          name="skip"
          checked={skip}
          onChange={onOptionChange}
          disabled={todo}
        />
      </td>
      <td>
        <input
          className="form-check-input"
          type="checkbox"
          name="only"
          checked={only}
          onChange={onOptionChange}
          disabled={todo}
        />
      </td>
      <td>{todo && <Edit width={24} height={24} svgColorName="var(--bs-pink)" />}</td>
      <td>
        {result && (
          <>
            {showResultModal &&
              ReactDOM.createPortal(
                <ResultModal
                  testResult={result}
                  domain={link}
                  dismiss={setShowResultModal.bind(null, false)}
                />,
                document.body
              )}
            <button
              type="button"
              className={classNames('btn btn-sm p-0 border-0', {
                'btn-success': result.pass,
                'btn-danger': !result.pass,
              })}
              onClick={onResultClicked}
            >
              <ResultIcon pass={result.pass} />
            </button>
          </>
        )}
      </td>
    </tr>
  )
}

type ResultModalProps = {
  dismiss: () => void
  testResult: DetectionTestResults
  domain: string
}

const ResultModal: React.FC<ResultModalProps> = (props) => {
  const {dismiss, testResult, domain} = props

  // prevent scrolling while open
  useEffect(() => {
    document.body.style.setProperty('overflow', 'hidden')
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [])

  // close on non-modal click
  const onBackdropClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.target === event.currentTarget) {
      dismiss()
    }
  }

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div
        className="modal show"
        id="resultModal"
        tabIndex={-1}
        aria-labelledby="resultModalLabel"
        style={{display: 'block'}}
        aria-modal="true"
        role="dialog"
        onClick={onBackdropClick}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="resultModalLabel">
                Test Result Details
              </h1>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={dismiss}
              ></button>
            </div>
            <div className="modal-body">
              <p>{domain}</p>
              <pre>
                <code>{JSON.stringify(testResult, null, 2)}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type ResultIconProps = {
  pass: boolean
}

const ResultIcon: React.FC<ResultIconProps> = (props) => {
  const {pass} = props
  if (pass) {
    return <Check width={24} height={24} svgColorName="currentcolor" />
  } else {
    return <Close width={24} height={24} svgColorName="currentcolor" />
  }
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = function onErrorFile() {
      reject(reader.error)
    }
    reader.onload = function onLoadFile() {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file'))
      }
      resolve(reader.result)
    }
    reader.readAsText(file)
  })
}

const processRecordsByDomain = (records: Record[]) => {
  const recordsByDomain: {[domain: string]: Record} = {}
  for (const record of records) {
    const recordURL = (() => {
      if (isRecordV3(record)) {
        return extractURLField(record)?.value[0]
      } else {
        return record.link
      }
    })()

    if (recordURL) {
      try {
        const recordDomain = urlHelperFactory(recordURL, 1, 2)
        recordsByDomain[recordDomain] = record
      } catch (e) {
        const message = getErrorMessage(e)
        console.warn(message, recordURL)
      }
    }
  }
  return recordsByDomain
}
