# backbone-publication
`backbone-publication` implements the boilerplate code that is required to make
`backbone` and our publication based system (through
[`publication-client`](https://github.com/mixmaxhq/publication-server/tree/master/client))
play nicely together. To use these classes, you simply need to instantiate them
with the necessary reactive queries from a `publication-client`. This normally
can be done in the bootstrapping process. For instance:

```js
// During the bootstrapping process we normally set most collections/models -
// using `backbone-publication` collections/models is no different.

setUserFeatures(new FeatureCollection(initialPayload.features, {
  reactiveQuery: pubClient.getCollection('features').find({ userId: getUser().id }),
  waitOn: pubClient.subscribe('features', ['branding'])
}));
```

Where FeatureCollection is defined as:

```js
import { PublicationCollection } from 'backbone-publication';

class FeatureCollection extends PublicationCollection {
  // Code removed for example purposes.
}

export default FeatureCollection;
```

Or if you don't want to use ES6 classes, you can do:
```js
import { PublicationCollection } from 'backbone-publication';

var FeatureCollection = PublicationCollection.extend({
  // Code removed for example purposes.
});

export default FeatureCollection;
```

There really shouldn't be any differences when migrating from
Backbone.Meteor[Model,Collection] - all the differences are handled under the
hood.
