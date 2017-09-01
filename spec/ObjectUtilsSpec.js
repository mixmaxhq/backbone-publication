import ObjectUtils from '../src/utils/ObjectUtils';

describe('ObjectUtils', () => {
  describe('#changes', () => {
    it('should return nothing when two objects are equal', () => {
      expect(ObjectUtils.changes({
        foo: 'bar',
        buzz: 'fuzz'
      }, {
        foo: 'bar',
        buzz: 'fuzz'
      })).toEqual({});
    });

    it('should return only the changed attributes when two objects are not equal', () => {
      expect(ObjectUtils.changes({
        foo: 'bar',
        buzz: 'fuzz'
      }, {
        foo: 'bar',
        buzz: 'muzz'
      })).toEqual({ buzz: 'muzz' });
    });

    it('should return nothing when two objects are equal and have equal nested attributes', () => {
      expect(ObjectUtils.changes({
        foo: 'bar',
        buzz: { fuzz: 0 }
      }, {
        foo: 'bar',
        buzz: { fuzz: 0 }
      })).toEqual({});
    });

    it('should return only the changed attributes when two objects with nested attributes are not equal', () => {
      expect(ObjectUtils.changes({
        foo: 'bar',
        buzz: { fuzz: 0 }
      }, {
        foo: 'bar',
        buzz: { fuzz: 1 }
      })).toEqual({ buzz: { fuzz: 1 } });
    });

    it('should return the entire top-level attribute when one of the child attributes changes', () => {
      expect(ObjectUtils.changes({
        foo: 'bar',
        buzz: { fuzz: 0, muzz: 0 }
      }, {
        foo: 'bar',
        buzz: { fuzz: 1, muzz: 0 }
      })).toEqual({ buzz: { fuzz: 1, muzz: 0 } });
    });

    it('should correctly identify changes in multi-level nesting', () => {
      expect(ObjectUtils.changes({
        foo: 'bar',
        buzz: {
          fuzz: {
            muzz: {
              guzz: 0,
              luzz: 0
            }
          }
        }
      }, {
        foo: 'bar',
        buzz: {
          fuzz: {
            muzz: {
              guzz: 1,
              luzz: 0
            }
          }
        }
      })).toEqual({ buzz: { fuzz: { muzz: { guzz: 1, luzz: 0 } } } });
    });

    it('should return attributes not present in the source object', () => {
      expect(ObjectUtils.changes({
        foo: 'bar'
      }, {
        foo: 'bar',
        buzz: 'fuzz'
      })).toEqual({ buzz: 'fuzz' });
    });

    it('should not return an attribute not present in the destination object', () => {
      expect(ObjectUtils.changes({
        foo: 'bar',
        buzz: 'fuzz'
      }, {
        foo: 'bar'
      })).toEqual({});
    });

    it('should not return changes in non-plain objects if their value is identical', () => {
      expect(ObjectUtils.changes({
        foo: new Date(0)
      }, {
        foo: new Date(0)
      })).toEqual({});
    });

    it('should return changes in non-plain objects if their value is different', () => {
      expect(ObjectUtils.changes({
        foo: new Date(0)
      }, {
        foo: new Date(1)
      })).toEqual({ foo: new Date(1) });
    });

    it('should not return changes in arrays if their values are identical', () => {
      expect(ObjectUtils.changes({
        foo: ['a','b','c']
      }, {
        foo: ['a','b','c']
      })).toEqual({});
    });

    it('should return changes in arrays if their values are different', () => {
      expect(ObjectUtils.changes({
        foo: ['a','b','c']
      }, {
        foo: ['a','b','d']
      })).toEqual({ foo: ['a','b','d'] });
    });

    it('should return changes in arrays if the destination object has more elements than the source', () => {
      expect(ObjectUtils.changes({
        foo: ['a','b','c']
      }, {
        foo: ['a','b','c','d']
      })).toEqual({ foo: ['a','b','c','d'] });
    });

    it('should return changes in arrays if the destination object has fewer elements than the source', () => {
      expect(ObjectUtils.changes({
        foo: ['a','b','c']
      }, {
        foo: ['a','b']
      })).toEqual({ foo: ['a','b'] });
    });

    it('should not return changes in arrays of objects if their values are identical', () => {
      expect(ObjectUtils.changes({
        foo: [{ bar: { buzz: 0 } }, { fuzz: 0 }]
      }, {
        foo: [{ bar: { buzz: 0 } }, { fuzz: 0 }]
      })).toEqual({});
    });

    it('should return changes in arrays of objects if their values are different', () => {
      expect(ObjectUtils.changes({
        foo: [{ bar: { buzz: 0, muzz: 0 } }, { fuzz: 0 }]
      }, {
        foo: [{ bar: { buzz: 1, muzz: 0 } }, { fuzz: 0 }]
      })).toEqual({ foo: [{ bar: { buzz: 1, muzz: 0 } }, { fuzz: 0 }] });
    });

    it('should not return changes in arrays nested within objects if their values are identical', () => {
      expect(ObjectUtils.changes({
        foo: {
          bar: [{
            buzz: {
              fuzz: 0,
              muzz: 0
            }
          }, {
            guzz: 0
          }]
        }
      }, {
        foo: {
          bar: [{
            buzz: {
              fuzz: 0,
              muzz: 0
            }
          }, {
            guzz: 0
          }]
        }
      })).toEqual({});
    });

    it('should return changes in arrays nested within objects if their values are different', () => {
      expect(ObjectUtils.changes({
        foo: {
          bar: [{
            buzz: {
              fuzz: 0,
              muzz: 0
            }
          }, {
            guzz: 0
          }]
        }
      }, {
        foo: {
          bar: [{
            buzz: {
              fuzz: 1,
              muzz: 0
            }
          }, {
            guzz: 0
          }]
        }
      })).toEqual({
        foo: {
          bar: [{
            buzz: {
              fuzz: 1,
              muzz: 0
            }
          }, {
            guzz: 0
          }]
        }
      });
    });
  });
});
