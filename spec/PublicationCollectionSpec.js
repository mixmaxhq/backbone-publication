import PublicationCollection from '../src/PublicationCollection';

describe('PublicationCollection', () => {
  describe('#initialize', () => {
    it('should successfully initialize with no parameters', () => {
      const collection = new PublicationCollection();
      expect(collection.length).toBe(0);
    });

    it('should successfully initialize when waitOn is true', () => {
      const collection = new PublicationCollection(undefined, {
        waitOn: {
          whenReady: () => Promise.resolve()
        }
      });
      expect(collection.length).toBe(0);
    });
  });
});
