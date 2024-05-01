import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { Kind, OperationTypeNode } from 'graphql';
import { Operation } from '@apollo/client';

export const getWsClient = (ws_connection: string) => new SubscriptionClient(ws_connection, {
    lazy: true,
    reconnect: true,
    connectionParams: () => {
      const accessToken = localStorage.getItem('access_token') ? JSON.parse(localStorage.getItem('access_token')!) : null;
      return {
        authorization: accessToken ? `Bearer ${accessToken}` : ''
      };
    }
  });

  export const isWebsocketSubscription = (operation: Operation) => {
    const definition = getMainDefinition(operation.query);
    return (
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.operation === OperationTypeNode.SUBSCRIPTION
    );
  }