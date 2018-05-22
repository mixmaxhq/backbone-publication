## Release History

* 1.0.10 - Fixed `PublicationCollection#set` return.

* 1.0.9 - Fixed another instance of object instances were considered plain objects. Replaced all `_.isObject` usages for `isPlainObject`

* 1.0.8 - Fixed issue where object instances were considered plain objects.

* 1.0.7 - Fixed incorrect function call in `PublicationModel.setReactiveQuery`.

* 1.0.6 - Fixed issue where `PublicationModel.set` did not always return `this`.

* 1.0.5 - Changed `PublicationModel.set` to correctly fire `change` events for nested objects.

* 1.0.4 - Reverted change on `PublicationModel.set` and added warning instead.

* 1.0.3 - Fixed issue with `PublicationModel.set` not firing `change` event.

* 1.0.2 - Util function name typo (`isObject` -> `isPlainObject`).

* 1.0.1 - Use our own local utils instead of external underscore extensions.

* 1.0.0 - Initial release.
