# MediFlow — QA Testing Suite & Excel Reports

## Overview
This directory contains the testing framework, automated test runners, test inventory, and formal Excel reporting workbooks for the **MediFlow** platform.

All testing code, configuration, and deliverables reside exclusively inside `testing/`. Application source code was inspected in read-only mode and remains strictly untouched.

---

## 1. Directory Structure

```
testing/
├── README.md                          # Testing framework documentation
├── build_reports.js                   # Report builder and Excel workbook generator
├── Test-Cases/
│   └── Master_Test_Cases.xlsx         # Master inventory of exactly 500 unique test cases
├── Web/
│   ├── Selenium/
│   │   └── SeleniumTestRunner.js      # Headless Chrome Selenium browser automation runner
│   ├── Load-Testing/
│   │   └── LoadTestRunner.js          # Autocannon 100 connections / 60s load benchmark
│   └── Vulnerability-Testing/
│       └── SecurityTestRunner.js      # Defensive dependency, secret & header security audit
├── Android/
│   └── Appium/
│       └── AppiumTestRunner.js        # Android Appium mobile automation environment runner
└── Reports/
    ├── MediFlow_Test_Report.xlsx      # 8-Sheet Comprehensive Test Report
    └── Execution_Summary.xlsx         # High-level KPI and execution summary
```

---

## 2. Test Allocation & Execution Breakdown

The master test inventory consists of **exactly 500 unique test cases**:

| Testing Area | Allocation | PASS | FAIL | BLOCKED | NOT RUN | NOT APPLICABLE | Total |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Selenium Web** | 200 | 110 | 0 | 0 | 90 | 0 | **200** |
| **Web Load / Performance** | 100 | 17 | 0 | 0 | 83 | 0 | **100** |
| **Web Vulnerability / Security** | 100 | 16 | 10 | 20 | 54 | 0 | **100** |
| **Android Appium Mobile** | 100 | 0 | 0 | 90 | 0 | 10 | **100** |
| **TOTAL** | **500** | **143** | **10** | **110** | **227** | **10** | **500** |

### Key KPI Metrics:
- **Total Master Test Inventory**: **500**
- **Total Executed Cases**: **153** (143 PASS, 10 FAIL)
- **Pass Rate**: **93.46%**
  $$\text{Pass Rate} = \frac{\text{PASS}}{\text{PASS} + \text{FAIL}} \times 100 = \frac{143}{143 + 10} \times 100 = 93.46\%$$
- **Execution Coverage**: **30.60%**
  $$\text{Execution Coverage} = \frac{\text{PASS} + \text{FAIL}}{\text{Total Inventory}} \times 100 = \frac{153}{500} \times 100 = 30.60\%$$

> [!NOTE]
> In accordance with strict QA standards, unexecuted tests (`BLOCKED`, `NOT RUN`, and `NOT APPLICABLE`) are excluded from the Pass Rate formula to avoid artificial inflation.

---

## 3. How to Run Tests Locally

Prerequisites:
- Node.js (v18+)
- Google Chrome browser (installed)
- MediFlow application server running on `http://localhost:5000`

```bash
# 1. Run Selenium browser tests:
node "testing/Web/Selenium/SeleniumTestRunner.js"

# 2. Run 100 connections web load benchmark:
node "testing/Web/Load-Testing/LoadTestRunner.js"

# 3. Run defensive security and vulnerability audit:
node "testing/Web/Vulnerability-Testing/SecurityTestRunner.js"

# 4. Run Android Appium environment probe:
node "testing/Android/Appium/AppiumTestRunner.js"

# 5. Regenerate Excel workbooks:
node "testing/build_reports.js"
```

---

## 4. Key Findings & Environment Limitations

1. **Security Headers (FAIL)**:
   - The Express application server currently omits `Content-Security-Policy` and `X-Frame-Options` HTTP response headers.
   - *Recommendation*: Mount the `helmet` middleware in `server/index.js`.
2. **Dependency Vulnerabilities (FAIL)**:
   - `npm audit` flags 2 critical vulnerabilities in transitive development packages.
   - *Recommendation*: Run `npm audit fix`.
3. **Android Mobile Execution (BLOCKED)**:
   - No active Android emulator (AVD) or physical device was attached on the host machine. Mobile tests are accurately recorded as `BLOCKED` with documented environment limitations.
