import PublicationModel from '../src/PublicationModel';

describe('PublicationModel', () => {
  describe('#set', () => {
    it('should trigger "change" for a set call in object style', (done) => {
      const model = new PublicationModel();

      model.on('change', () => {
        const changes = model.changedAttributes();

        expect(changes.foo).toEqual(true);
        done();
      });

      model.set({foo: true});
    });

    it('should trigger "change" for a set call in (key, value) style', (done) => {
      const model = new PublicationModel();

      model.on('change', () => {
        const changes = model.changedAttributes();

        expect(changes.foo).toEqual(false);
        done();
      });

      model.set('foo', false);
    });

    it('should trigger a change for a nested attribute change', (done) => {
      const model = new PublicationModel({ foo: { bar: true } });

      model.on('change', (model, changes) => {
        expect(changes.foo.bar).toEqual(false);
        done();
      });

      model.set({
        foo: {
          bar: false
        }
      });
    });

    it('should trigger a change if the nested attribute is more than one level deep', (done) => {
      const model = new PublicationModel({ foo: { bar: { buzz: true } } });

      model.on('change', (model, changes) => {
        expect(changes.foo.bar.buzz).toEqual(false);
        done();
      });

      model.set({
        foo: {
          bar: {
            buzz: false
          }
        }
      });
    });

    it('should trigger a change for a nested attribute change when other root-level attributes remain the same', (done) => {
      const model = new PublicationModel({ foo: 'bar', buzz: { fuzz: true } });

      model.on('change', (model, changes) => {
        expect(changes.buzz.fuzz).toEqual(false);
        done();
      });

      model.set({
        foo: 'bar',
        buzz: {
          fuzz: false
        }
      });
    });
  });
});
