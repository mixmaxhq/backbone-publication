import _ from 'underscore';
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

    it('should not change the value of a nested date object on a second set', (done) => {
      const model = new PublicationModel();
      const date = new Date();
      const cb = _.after(2, done);

      model.on('change', () => {
        expect(model.get('bar').qux).toEqual(date);
        cb();
      });

      model.set({ foo: 'bar', bar: { qux: date } });
      model.set({ foo: 'hello', bar: { qux: date, baz: true } });
    });

    it('should not change value of a nested date object when setting another property', function () {
      const date = new Date('2017-09-07T23:23:00.000Z');

      const data = {
        foo: 'bar',
        wubble: 'hi',
        baz: {
          qux: new Date('2017-09-07T23:23:00.000Z')
        }
      };

      const model = new PublicationModel(data);

      expect(model.get('baz').qux).toEqual(jasmine.any(Date));
      expect(model.get('baz').qux).toEqual(date);

      model.set('wubble', 'foo');

      expect(model.get('baz').qux).toEqual(jasmine.any(Date));
      expect(model.get('baz').qux).toEqual(date);
    });
  });
});
