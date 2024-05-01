import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  from,
  fromPromise,
  InMemoryCache,
  split
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';

import { REFRESH_TOKEN } from '../mutations';
import { isWebsocketSubscription } from './helpers';

import { HTTP_GRAPHQL_ENDPOINT, WS_GRAPHQL_ENDPOINT } from './consts';
import { getWsClient } from './helpers';

const wsClient = getWsClient(WS_GRAPHQL_ENDPOINT)
const httpLink = createHttpLink({ uri: HTTP_GRAPHQL_ENDPOINT });
const wsLink = new WebSocketLink(wsClient);

export const getRefreshedToken = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refresh_token') ? JSON.parse(localStorage.getItem('refresh_token')!) : null;
  if (refreshToken) {
    localStorage.setItem('access_token', JSON.stringify(refreshToken));
  }

  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN,
      variables: {
        refreshToken: refreshToken
      }
    });

    const { access_token, refresh_token } = data.refreshTokenV2;

    localStorage.setItem('access_token', JSON.stringify(access_token));
    localStorage.setItem('refresh_token', JSON.stringify(refresh_token));
  } catch (e) {
    throw new Error('Error refreshing token');
  }
};

const authLink = setContext((_, { headers }) => {
  const accessToken = localStorage.getItem('access_token') ? JSON.parse(localStorage.getItem('access_token')!) : null;
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : ''
    }
  };
});

const errorLink: ApolloLink = onError(({ graphQLErrors, operation, forward }) => {
  let promise = Promise.resolve();
  let isRefreshingToken: boolean = false;

  if (graphQLErrors?.some(err => err.message === 'Unauthorized')) {
    const isWebsocket = isWebsocketSubscription(operation);
    if (!isRefreshingToken) {
      isRefreshingToken = true;
      promise = getRefreshedToken()
        .then(() => {
          isRefreshingToken = false;
          if (isWebsocket) {
            wsClient.close(true);
          }
        })
        .catch(() => {
          localStorage.clear();
          window.location.reload();
        });
    } else {
      return forward(operation);
    }

    return fromPromise(promise).flatMap(() => {
      return forward(operation);
    });
  }
});

const operationLinks: ApolloLink = split(
  operation => {
    return isWebsocketSubscription(operation);
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: from([authLink, errorLink, operationLinks]),
  cache: new InMemoryCache()
});