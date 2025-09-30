declare module "@data/test-data.json" {
  interface SecurityTests {
    xss_attempts: string[];
    prompt_injections: string[];
    sql_injection: string[];
  }

  interface TestData {
    security_tests: SecurityTests;
    [key: string]: any; // other test data if present
  }

  const value: TestData;
  export default value;
}
