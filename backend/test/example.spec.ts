/**
 * This is a simple example of how to write unit tests with Jest.
 */
describe('Example', () => {
  beforeEach(() => {
    console.log('beforeEach');
  });

  afterEach(() => {
    console.log('afterEach');
  });

  beforeAll(() => {
    console.log('beforeAll');
  });

  afterAll(() => {
    console.log('afterAll');
  });

  it('should work', () => {
    expect(1).toBe(1);
  });

  it('should expect an error', () => {
    expect(() => {
      throw new Error('test');
    }).toThrow('test');
  });

  describe('nested describe', () => {
    it('should work', () => {
      expect(1).toBe(1);
    });
  });
});
