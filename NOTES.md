# Notes around Production Release

## General

In this section, I describe some of the issues I encountered, which fundamented some od the thoughts conveyed in this document. 

The implementation of the call filter feature is not the best. This is due to the the gql api not allowing for sorting calls by date. This not being possible, I fetched as much of the available data into the frontend, in order to sort the data and group it into days. The filtering of data based on call origin, and type(voicemail, answered, missed) is also being done in the frontend. 

### Caching

Ideally, the sorting and filtering by call type would be available in the gql endpoints, thereby eliminating the need to perform expensive sort/filter operations in the frontend. While the volume of calls processed is not significant, the current option does not scale well for a large number of calls, (or at least, this is not a solution I like - filtering/sorting data in the frontend; I prefer that for larger sets of data, as much data processing is done on the backend)

Additionally, being able to perform these operations in the gql server, would allow us to also leverage query caching, in a more efficient manner, for instance, using something like readQuery, where we would query data that we had previously cached using ApolloGraphQL.

### Libraries Used

The project is using some outdated libraries. These are the libraries which are currently outdated (obtained running yarn outdated):

@aircall/tractor            2.0.0-next.13 2.0.0-next.13 3.0.34  dependencie
@testing-library/jest-dom   5.17.0        5.17.0        6.4.2   dependencies https://github.com/testing-library/jest-dom#readme
@testing-library/react      13.4.0        13.4.0        15.0.5  dependencies https://github.com/testing-library/react-testing-library#readme
@testing-library/user-event 13.5.0        13.5.0        14.5.2  dependencies https://github.com/testing-library/user-event#readme
@types/jest                 27.5.2        27.5.2        29.5.12 dependencies https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/jest
@types/node                 16.18.96      16.18.96      20.12.7 dependencies https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node
date-fns                    2.30.0        2.30.0        3.6.0   dependencies https://github.com/date-fns/date-fns#readme
husky                       8.0.3         8.0.3         9.0.11  dependencies https://github.com/typicode/husky#readme
lint-staged                 13.3.0        13.3.0        15.2.2  dependencies https://github.com/okonet/lint-staged#readme
prettier                    2.8.8         2.8.8         3.2.5   dependencies https://prettier.io
styled-components           5.3.11        5.3.11        6.1.9   dependencies https://styled-components.com
typescript                  4.9.5         4.9.5         5.4.5   dependencies https://www.typescriptlang.org/
web-vitals                  2.1.4         2.1.4         3.5.2   dependencies https://github.com/GoogleChrome/web-vitals#readme

The development of this feature could serve as an opportunity to try and update some of these libraries, and if there aren't any significant changes, these updates could be incorporated into a separate PR, which would be merged into master, just ahead of the merge of the new feature.

For more complicated upgrades (for instance, upgrading UI libraries can many times pose a problem, and can lead to a situation in which we might have tow differing versions of the same library in the codebase), these should be flagged and a backlog item for updating these libraries, should be planned. 

I prefer to have updated library versions, as much as possible, for handling security issues that may arise, out of using these outdated libraries, as well as ensuring that we get the latest benefits that newer library versions might confer.

There is also a deprecation notice in the library being used for websocket communication with GraphQL: `subscriptions-transport-ws`. This library should be replaced with the recommended library.

### Testing 

#### Unit Tests

Some tests were written with regard to the time helper functions, but some more tests should be put together, in order to get better converage on edge cases that might've been missed. We should also add tests that can ensure that the websocket updates are working as expected, without relying exclusively on Cypress, as there are some aspects that need to be tested, which could result in test flakiness in cypress and lead to false positives, impacting negatively the CI/CD process.

#### Accessibility Tests

The features put together, while functional could be improved with regards to supporting accessibility. Some manual tests would have to be conducted in order to ensure that correct tab order is maintained on the feature, and that all features can be activated using only keyboard navigation. During this phase, tests that can be automated, should be identified and written. These tests would check for the existence of correct attributes and the usage of semantic html. 

#### E2E Tests

Right now, only basic features are covered. Additional tests covering other scenarios, should be added, such as guaranteeing that the websocket archiving feature works as expected, on simulatneous browser tabs.

While this aspect is not strictly related to E2E testing, we should also put together some tests that check for UI layout consistency, so that in the future, if any other features are added or removed, we can be assured that no unintentional UI breakage occurs. 

These specific tests could then be added to the CI/CD pipeline, before a feature is merged.

### Improvements

We should identify components of a given feature that can be converted into reusable components. This might be hard to do during implementation, but it is something to be aware during development.

The Calls archive, at the moment shows all calls in the same interface, the distinguishing feature being a change in the card color and the button that archives the calls. A better alternative would be to have archived calls be displayed in a separate tab, and only have them be displayed in the general calls list, if a user unarchives the calls, from the archived view tab. 

We should also allow users to select multiple calls and archive/unarchive them in a single operation, rather than having the user click on each call he intends to operate on.

The documentation of the Tractor Design System, could be improved, in order to include more information on the best way to use the components of this library. For instance, some samples showing the integration of various components, in some scenarios, would facilitate the ramp up and usage of this library.
