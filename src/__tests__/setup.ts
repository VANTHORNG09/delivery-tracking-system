process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.LOG_LEVEL = 'error';

beforeAll(() => {
  // eslint-disable-next-line no-console
  console.log('Starting test suite...');
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.log('Test suite completed.');
});
