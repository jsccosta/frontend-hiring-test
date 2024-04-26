import { ApolloClient, createHttpLink, from, fromPromise, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { REFRESH_TOKEN } from '../mutations';

const httpLink = createHttpLink({
  uri: 'https://frontend-test-api.aircall.dev/graphql'
});

const getRefreshedToken = async (): Promise<void> => {
  let isRefreshingToken: boolean = false;
  const refreshToken = localStorage.getItem('refresh_token') ? JSON.parse(localStorage.getItem('refresh_token')!) : null;

  if (refreshToken) {
    localStorage.setItem('access_token', JSON.stringify(refreshToken));
  }

  if (isRefreshingToken) return;

  isRefreshingToken = true;

  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN,
      variables: {
        refreshToken: refreshToken
      }
    });

    isRefreshingToken = false;

    const { access_token, refresh_token } = data.refreshTokenV2;

    localStorage.setItem('access_token', JSON.stringify(access_token));
    localStorage.setItem('refresh_token', JSON.stringify(refresh_token));
  } catch (e) {
    throw new Error('Error refreshing token');
  }
};

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      const exception = err.extensions.exception as { status: number };
      
      if (exception && exception.status === 401) {
        return fromPromise(
          getRefreshedToken().catch(() => {
            localStorage.clear();
            window.location.href = '/login';
          })
        ).flatMap(() => {
          return forward(operation);
        });
      }
    }
  }
});

const authLink = setContext((_, { headers }) => {

  const accessToken = localStorage.getItem('access_token') ? JSON.parse(localStorage.getItem('access_token')!) : null;
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : ''
    }
  };
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache()
});