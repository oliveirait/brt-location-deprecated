import {  HStack, Spinner } from 'native-base';

export function Loading(  ) {
  return (
    <HStack space={2} justifyContent="center">
      <Spinner accessibilityLabel="Loading posts" fontSize={'md'} color="primary.500" />
    </HStack>
  );
}