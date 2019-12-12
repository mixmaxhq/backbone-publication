import PublicationCollection from '../src/PublicationCollection';

describe('PublicationCollection', () => {
  describe('#initialize', () => {
    it('should successfully initialize with no parameters', () => {
      const collection = new PublicationCollection();
      expect(collection.length).toBe(0);
    });
  });
});
