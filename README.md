# backbone-publication
[![Build Status](https://travis-ci.org/mixmaxhq/backbone-publication.svg?branch=master)](https://travis-ci.org/mixmaxhq/backbone-publication)

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
* 1.0.7 - Fixed incorrect function call in `PublicationModel.setReactiveQuery`.
* 1.0.6 - Fixed issue where `PublicationModel.set` did not always return `this`.
* 1.0.5 - Changed `PublicationModel.set` to correctly fire `change` events for nested objects.
* 1.0.4 - Reverted change on `PublicationModel.set` and added warning instead.
* 1.0.3 - Fixed issue with `PublicationModel.set` not firing `change` event.
* 1.0.2 - Util function name typo (`isObject` -> `isPlainObject`).
* 1.0.1 - Use our own local utils instead of external underscore extensions.
* 1.0.0 - Initial release.
