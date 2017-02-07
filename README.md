# backbone-publication
`backbone-publication` implements the boilerplate code that is required to make
`backbone` and our publication based system (through
[`publication-client`](https://github.com/mixmaxhq/publication-server/tree/master/client))
play nicely together. To use these classes, you simply need to instantiate them
with the necessary reactive queries from a `publication-client`. This normally
can be done in the bootstrapping process. For instance:

```js
// During the bootstrapping process we normally initialize most
// collections/models - using `backbone-publication` collections/models is no
// different.

var featureCollection = new FeatureCollection(initialPayload.features, {
  // pubClient is initialized by using the `publication-client` constructor.
  reactiveQuery: pubClient.getCollection('features').find({ userId: getUser().id }),
  waitOn: pubClient.subscribe('features', ['branding'])
}));
```

Where FeatureCollection is defined as:

```js
import { PublicationCollection } from 'backbone-publication';

// Note that we only need to extend the Publication[Collection,Model]s if we
// need to add custom behavioural overrides.
var FeatureCollection = PublicationCollection.extend({
  // Code removed for example purposes.
});

export default FeatureCollection;
```

### Changelog
* 1.0.0 Initial release.
